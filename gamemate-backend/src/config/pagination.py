from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


# Shared pagination class used for list responses across the API.
class StandardPageNumberPagination(PageNumberPagination):
    """Project-wide pagination envelope for consistent API list responses."""

    # Return normalized pagination envelope used by frontend clients.
    def get_paginated_response(self, data):
        """Return paginated payload with success flag and navigation metadata."""
        return Response(
            {
                "success": True,
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )
