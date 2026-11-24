import pytest


def auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


@pytest.mark.asyncio
async def test_healthcheck(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == "ok"


@pytest.mark.asyncio
async def test_register_user_returns_access_token_and_refresh_cookie(client):
    response = await client.post(
        "/api/v1/users",
        json={
            "display_name": "Alice",
            "username": "alice",
            "email": "alice@example.com",
            "password": "a-strong-test-password",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["user_data"]["username"] == "alice"
    assert body["user_data"]["email"] == "alice@example.com"
    assert body["token"]["access_token"]
    assert response.cookies.get("refresh_token")
    assert "httponly" in response.headers.get("set-cookie", "").lower()


@pytest.mark.asyncio
async def test_duplicate_username_is_rejected(client, registered_user):
    response = await client.post(
        "/api/v1/users",
        json={
            "display_name": "Duplicate",
            "username": "test_user",
            "email": "different@example.com",
            "password": "some-password",
        },
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_current_user_requires_access_token(client):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_current_user_returns_authenticated_profile(client, registered_user):
    response = await client.get(
        "/api/v1/users/me",
        headers=auth_headers(registered_user["access_token"]),
    )
    assert response.status_code == 200
    assert response.json()["id"] == registered_user["id"]
    assert response.json()["username"] == "test_user"
    assert "password_hash" not in response.json()


@pytest.mark.asyncio
async def test_login_with_username(client, registered_user):
    response = await client.post(
        "/api/v1/auth/login/username",
        json={
            "username": "test_user",
            "password": "correct-horse-battery-staple",
        },
    )
    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.cookies.get("refresh_token")


@pytest.mark.asyncio
async def test_login_rejects_wrong_password(client, registered_user):
    response = await client.post(
        "/api/v1/auth/login/username",
        json={"username": "test_user", "password": "wrong-password"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rotates_refresh_cookie(client, registered_user):
    old_refresh = client.cookies.get("refresh_token")
    assert old_refresh

    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 200
    assert response.json()["access_token"]
    new_refresh = client.cookies.get("refresh_token")
    assert new_refresh
    assert new_refresh != old_refresh

    # The previous refresh token must no longer be accepted.
    client.cookies.set("refresh_token", old_refresh)
    replay_response = await client.post("/api/v1/auth/refresh")
    assert replay_response.status_code == 401


@pytest.mark.asyncio
async def test_logout_revokes_refresh_session(client, registered_user):
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 204

    refresh_response = await client.post("/api/v1/auth/refresh")
    assert refresh_response.status_code == 401


@pytest.mark.asyncio
async def test_create_post_and_read_feed(client, registered_user):
    headers = auth_headers(registered_user["access_token"])
    created = await client.post(
        "/api/v1/posts",
        json={"title": "First post", "content": "Hello, Eternal Feed!"},
        headers=headers,
    )
    assert created.status_code == 201

    feed = await client.get("/api/v1/posts")
    assert feed.status_code == 200
    assert any(
        post["title"] == "First post"
        and post["content"] == "Hello, Eternal Feed!"
        for post in feed.json()
    )


@pytest.mark.asyncio
async def test_post_creation_requires_authentication(client):
    response = await client.post(
        "/api/v1/posts",
        json={"title": "Anonymous", "content": "Should not be accepted"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_post_owner_can_delete_post(client, registered_user):
    headers = auth_headers(registered_user["access_token"])
    await client.post(
        "/api/v1/posts",
        json={"title": "Temporary", "content": "Delete me"},
        headers=headers,
    )
    feed = await client.get("/api/v1/posts")
    post = next(item for item in feed.json() if item["title"] == "Temporary")

    deleted = await client.delete(
        f"/api/v1/posts/{post['id']}",
        headers=headers,
    )
    assert deleted.status_code == 204


@pytest.mark.asyncio
async def test_non_owner_cannot_delete_post(client, registered_user):
    headers = auth_headers(registered_user["access_token"])
    await client.post(
        "/api/v1/posts",
        json={"title": "Protected", "content": "Owned by first user"},
        headers=headers,
    )
    feed = await client.get("/api/v1/posts")
    post = next(item for item in feed.json() if item["title"] == "Protected")

    other_user = await client.post(
        "/api/v1/users",
        json={
            "display_name": "Other",
            "username": "other_user",
            "email": "other@example.com",
            "password": "another-strong-password",
        },
    )
    assert other_user.status_code == 201
    other_token = other_user.json()["token"]["access_token"]

    deleted = await client.delete(
        f"/api/v1/posts/{post['id']}",
        headers=auth_headers(other_token),
    )
    assert deleted.status_code == 401


@pytest.mark.asyncio
async def test_create_and_fetch_comment(client, registered_user):
    headers = auth_headers(registered_user["access_token"])
    await client.post(
        "/api/v1/posts",
        json={"title": "Discussion", "content": "A post to comment on"},
        headers=headers,
    )
    feed = await client.get("/api/v1/posts")
    post = next(item for item in feed.json() if item["title"] == "Discussion")

    created = await client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"content": "First comment"},
        headers=headers,
    )
    assert created.status_code == 201
    assert created.json()["content"] == "First comment"

    comments = await client.get(f"/api/v1/posts/{post['id']}/comments")
    assert comments.status_code == 200
    assert any(item["content"] == "First comment" for item in comments.json()["items"])


@pytest.mark.asyncio
async def test_comment_creation_requires_authentication(client, registered_user):
    headers = auth_headers(registered_user["access_token"])
    await client.post(
        "/api/v1/posts",
        json={"title": "Post", "content": "Content"},
        headers=headers,
    )
    feed = await client.get("/api/v1/posts")
    post = next(item for item in feed.json() if item["title"] == "Post")

    response = await client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"content": "Anonymous comment"},
    )
    assert response.status_code == 401
