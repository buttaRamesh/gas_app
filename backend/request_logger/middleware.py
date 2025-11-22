import traceback
from django.utils.timezone import now
from .models import APILog, APIErrorLog


class APILogMiddleware:
    """
    Logs all incoming API requests and exceptions to DB and console.
    Also logs 4xx and 5xx responses as errors.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only monitor API calls
        if not request.path.startswith("/api/"):
            return self.get_response(request)
        # 🚫 Skip logging of logger endpoints themselves
        if request.path.startswith("/api/logger/"):
            return self.get_response(request)
        ip = self.get_client_ip(request)
        # referer = request.META.get("HTTP_REFERER", "N/A")
        referer = (
            request.META.get("HTTP_X_REQUESTED_FROM")
            or request.META.get("HTTP_REFERER")
            or "N/A"
        )
        print('referer',referer)
        try:
            response = self.get_response(request)

            # ✅ Handle 4xx / 5xx responses as errors
            if response.status_code >= 400:
                APIErrorLog.objects.create(
                    ip_address=ip,
                    method=request.method,
                    path=request.path,
                    referer=referer,
                    status_code=response.status_code,
                    error_type=f"HTTP {response.status_code}",
                    error_message=f"Response returned with status {response.status_code}",
                    traceback=None,
                )
                print(
                    f"[{now()}] ⚠️ {request.method} {request.path} "
                    f"from {ip} (Status: {response.status_code}) logged as error"
                )
            else:
                APILog.objects.create(
                    ip_address=ip,
                    method=request.method,
                    path=request.path,
                    referer=referer,
                    status_code=response.status_code,
                )
                print(
                    f"[{now()}] ✅ {request.method} {request.path} "
                    f"from {ip} (Referer: {referer}) → {response.status_code}"
                )

            return response

        except Exception as e:
            # 🔥 Real exception caught (e.g., DB errors)
            tb_str = traceback.format_exc()
            APIErrorLog.objects.create(
                ip_address=ip,
                method=request.method,
                path=request.path,
                referer=referer,
                status_code=500,
                error_type=type(e).__name__,
                error_message=str(e),
                traceback=tb_str,
            )
            print(
                f"[{now()}] ❌ ERROR {request.method} {request.path} "
                f"from {ip} ({type(e).__name__}: {str(e)})"
            )
            print(tb_str)
            raise e  # Let Django handle it

    def get_client_ip(self, request):
        """Extract real client IP address"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip
