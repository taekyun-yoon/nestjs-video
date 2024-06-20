관련 명령어 정리

#docker-compose.yml 파일에서 정의된 모든 서비스 실행
➜  nestjs-video git:(main) ✗ docker-compose up 

#도커에서 실행중인 모든 컨테이너 조회
➜  nestjs-video git:(main) ✗ docker ps --all

#특정 컨테이너 접속 및 컨테이너 내부의 PostgreSQL 데이터베이스에 접속
➜  nestjs-video git:(main) ✗ docker exec -it "container_id" psql -U "user_name"

#데이터베이스 목록 조회
postgres=# \l

#특정 데이터베이스 접속
postgres=# \c "db_name"
You are now connected to database "db_name" as user "user_name".

#테이블 목록 조회
postgres=# \dt