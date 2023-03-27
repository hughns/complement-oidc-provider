# complement-oidc-provider
Matrix homeserver OpenID Provider for use with Complement

It exposes a dummy Token Introspection endpoint. This simply takes the contents of the `Authorization` bearer token as the base64 encoded token introspection response.
