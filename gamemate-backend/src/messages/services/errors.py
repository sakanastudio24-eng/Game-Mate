class MessageDomainError(Exception):
    """Base exception for message-domain service errors."""


class DomainNotFoundError(MessageDomainError):
    """Raised when a requested thread/user resource does not exist."""


class DomainPermissionError(MessageDomainError):
    """Raised when the requester is not allowed to access the resource."""


class DomainValidationError(MessageDomainError):
    """Raised for invalid message-domain input values."""
