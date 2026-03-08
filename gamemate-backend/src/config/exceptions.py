from rest_framework.exceptions import ErrorDetail
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """Normalize DRF exceptions into a stable backend response envelope."""
    response = exception_handler(exc, context)
    if response is None:
        return response

    payload = {"success": False, "message": "Request failed."}
    data = response.data

    if isinstance(data, dict):
        detail = data.get("detail")
        if isinstance(detail, (str, ErrorDetail)):
            payload["message"] = str(detail)
        elif detail is not None:
            payload["message"] = str(detail)
            payload["errors"] = data
        else:
            payload["message"] = "Validation failed."
            payload["errors"] = data
    elif isinstance(data, list):
        payload["message"] = "Validation failed."
        payload["errors"] = data
    else:
        payload["message"] = str(data)

    response.data = payload
    return response
