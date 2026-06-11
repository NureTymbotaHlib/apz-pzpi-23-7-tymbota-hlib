@echo off
cd /d %~dp0
locust -f locustfile.py --host http://localhost:8080
