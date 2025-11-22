from django.db import models

class APILog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=255)
    referer = models.CharField(max_length=255, null=True, blank=True)
    status_code = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.method} {self.path} ({self.status_code})"


class APIErrorLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=255)
    referer = models.CharField(max_length=255, null=True, blank=True)
    status_code = models.IntegerField(default=500)
    error_type = models.CharField(max_length=100)
    error_message = models.TextField()
    traceback = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.error_type} on {self.path}"
