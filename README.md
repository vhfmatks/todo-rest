

## Todo List App

### 요구 조건

* 사용자는 텍스트로 된 할일을 추가할 수 있다.
* 할일 추가 시 다른 할일들을 참조 걸 수 있다.
* 참조는 다른 할일의 id를 명시하는 형태로 구현한다. (예시 참고)
* 사용자는 할일을 수정할 수 있다.
* 사용자는 할일 목록을 조회할 수 있다.
* 조회시 작성일, 최종수정일, 내용이 조회 가능하다.
* 할일 목록은 페이징 기능이 있다.
* 사용자는 할일을 완료처리 할 수 있다.
* 완료처리 시 참조가 걸린 완료되지 않은 할일이 있다면 완료처리할 수 없다. (예시 참고)

### 예시

| id | 할일         | 작성일시            | 최종수정일시        | 완료처리 |
|----|--------------|---------------------|---------------------|-----------|
| 1  | 집안일       | 2018-04-01 10:00:00 | 2018-04-01 13:00:00 |           |
| 2  | 빨래 @1      | 2018-04-01 11:00:00 | 2018-04-01 11:00:00 |           |
| 3  | 청소 @1      | 2018-04-01 12:00:00 | 2018-04-01 13:00:00 |           |
| 4  | 방청소 @1 @3 | 2018-04-01 12:00:00 | 2018-04-01 13:00:00 |           | 
                        | 1 | 2 | 3 | 4 | 5 |

### 구현 언어

* Backend  : Nodejs & Express<br>
    * Test Tool : Mocha & Chai
* Frontend : Reactjs
* Database : Sqlite3 (in-memory)


## 문제 해결 전략

`데이터베이스 테이블 구조` 및 `조회`,`갱신`,`입력`에 대한 구현은 다음과 같습니다.

### 테이블 구조

총 2개의 테이블로 구성

 > - `할일` 목록을 관리하는 `TBTODO` 테이블과, 할일에 대한 `참조`를 관리하는 `TBREF`로 구성된다.
 > - `TBTODO`와 `TBREF`의 관계는 1:N 관계이다.
 > - 외래키는 별도 설정하지 않는다.

**1. TBTODO**

| 컬럼명 | 자료형 | nullable | 설명 |
|-------|-------|----------|------|
|  ID   | INTEGER| NOT NULL| id   |
|  TODO | TEXT   |         | 할일 |
| REG_DATE| DATETIME|      | 작성일시|
| CHNG_DATE| DATETIME|      | 최종수정일시|
| IS_COMMIT| CHAR(1) |     | 완료처리(Y,N)|

**2. TBREF**

| 컬럼명 | 자료형 | nullable | 설명 |
|-------|-------|----------|------|
|  ORI_ID| INTEGER| NOT NULL| 할일   |
| REF_ID | INTEGER   |  NOT NUL | 참조할일 |


**Example) 할일 목록 예시**

| id | 할일         | 작성일시            | 최종수정일시        | 완료처리 |
|----|--------------|---------------------|---------------------|-----------|
| 1  | 집안일      | 2018-04-01 10:00:00 | 2018-04-01 13:00:00 |           |
| 2  | 빨래        | 2018-04-01 11:00:00 | 2018-04-01 11:00:00 |           |
| 3  | 청소 @1 @2  | 2018-04-01 11:00:00 | 2018-04-01 11:00:00 |           |
    
 3번 ID 가 참조하는 일의 id는 `1`과 `2` 이므로, `TBREF` 에는 다음과 같이 데이터가 입력된다.

|ORI_ID | REF_ID |
|-------|--------|
|   3   |   1    |
|   3   |   2    |

<br>

### 조회, 갱신, 입력

**1. 조회 [GET Method]**

> 할일 목록을 조회한다.

SQL 의 `limit`과 `offset`을 이용한 페이징 조회 
```
select a.id
     , a.todo
     , a.reg_date
     , a.chng_date
     , a.is_commit
     , ifnull(
       (select group_concat(b.ref_id,',')
          from tbref b
         where a.id = b.ori_id), '') ref_id
          from tbtodo a
    limit ?
    offset ?
```

[Request]

`limit`(1회 요청에 조회되는 최대 건수) 과 `page`(현재 조회하는 page) 를 query string으로 넘겨줌
```
GET /todos?limit={limit}&page={page}
```
[Response]

|키       |설명                | 필수|타입 |
|---------|--------------------|---|----|
|total_cnt| 할일목록의 전체 건수 | O | int|
|status   | 성공여부(success, error) | O | string|
|data  | 할일 목록 데이터 |O|array| 

```
결과 예시)

HTTP 200 OK
{
    "total_cnt": 4,
    "status": "success",
    "data": [
        {
            "id": 1,
            "todo": "집안일",
            "reg_date": "2018-08-29 21:01:32",
            "chng_date": "2018-08-29 21:01:32",
            "is_commit": "N",
            "ref_id": ["2","3"]
        },
        {
            "id": 2,
            "todo": "빨래",
            "reg_date": "2018-08-29 21:01:32",
            "chng_date": "2018-08-29 21:01:32",
            "is_commit": "N",
            "ref_id": [""]
        }
    ]
}
```


**2. 갱신 [PUT Method]**

> 할일 TEXT와 완료여부를 갱신할 수 있다.

[Request]

| 키 | 설명 | 필수 | 타입|
|---|---|---|---|
| id| 갱신 대상 ID | O | int|
| todo| 할일 Text | X | string|
| is_commit | 완료여부 | O | string(Y, N)|

```
갱신 예시) 

PUT /todos
{
    "id"       : 2,
    "todo"     : "코딩",
    "is_commit": "Y"
}
```
[Response]

| 키 | 설명 | 필수 | 타입|
|---|---|---|---|
|status   | 성공여부(success, error)| O | string|
|data  | 갱신된 데이터 or 사유메시지 | O |array|

```
결과 예시)

HTTP 200 OK (Success)
{
    "status": "success",
    "data": {
        "id": 2,
        "todo": "코딩",
        "is_commit": "Y"
    }
}

HTTP 200 OK (Error)
{
    "status": "error",
    "data": "참조된 할일이 완료되지 않았음"
}


```

**3. 입력 [POST Method]**

> 신규 할일을 입력할 수 있다. 입력 시 다른 ID 참조 가능
[Request]

| 키 | 설명 | 필수 | 타입|
|---|---|---|---|
| todo| 할일 Text | O | string|
| ref | 참조ID | X | Array|

```
입력 예시) 

POST /todos
{
	"todo" : "책상정리",
	"ref"  : [ 1 , 2 ]
}

```
[Response]

| 키 | 설명 | 필수 | 타입|
|---|---|---|---|
|status   | 성공여부(success, error)| O | string|
|data  | 입력된 할일의 ID |O|int|

```
결과 예시)

HTTP 200 OK (Success)
{
    "status": "success",
    "data": 5
}
```



## 실행방법

프로젝트 Root디렉토리에서 install 및 start 실행한다.

### REST API [github](https://github.com/vhfmatks/todo-rest)

 ``` 
 $ npm install 
 ```
 프로그램에 필요한 모듈 설치
	
 ``` 
 $ npm start 
 ```
 Rest API 실행 (http://localhost:8001/todos)
 ``` 
 $ npm test 
 ```
 API 단위 테스트 진행 <br>
 <img src="http://14.63.175.62/todo/mocha-test.png" width="70%">
### REACT [github](https://github.com/vhfmatks/todo-react)

 ``` 
 $ npm install
 ```
 프로그램에 필요한 모듈 설치
 ``` 
 $ npm start 
 ```
 WEB Browser 를 통한 실행 (http://localhost:3000)
 <br><br>
 <img src="http://14.63.175.62/todo/todo-list.png" width="90%">
 
## Live Demo

개발된 프로젝트는 다음 주소에서 백엔드와 프론트엔드 각각 실행해볼 수 있습니다.

* Backend (Express): (http://yhchoi.iptime.org:8001/todos)
* Frontend(React)  : (http://14.63.175.62/todo/)
