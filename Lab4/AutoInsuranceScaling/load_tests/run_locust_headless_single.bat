@echo off
cd /d %~dp0
locust -f locustfile.py --headless -u 100 -r 10 -t 2m --host http://localhost:8080 --csv results\single_instance
