

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);

const url = 'http://localhost:8001';


describe('TODOS GET TEST', () => {
    it('# GET : 할일 목록 조회(기본 조회) /todos', (done) => {
        chai.request(url)
            .get('/todos')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('status');
                res.body.status.should.equal('success');
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.length.should.equal(4);
                res.body.data[0].should.have.property('id');
                res.body.data[0].should.have.property('todo');
                res.body.data[0].should.have.property('reg_date');
                res.body.data[0].should.have.property('chng_date');
                res.body.data[0].should.have.property('is_commit');
                res.body.data[0].should.have.property('ref_id');
                res.body.data[0].ref_id.should.be.a('array');
                done();
            });
    });
    it('# GET : 할일 목록 조회(limit) /todos?limit=2&page=1', (done) => {
        chai.request(url)
            .get('/todos?limit=2&page=1')
            .end((err, res)=>{
                res.should.have.status(200);
                res.body.should.have.property('status');
                res.body.status.should.equal('success');
                res.body.data.length.should.equal(2);
                done();
            });
    });
  });
  describe('TODOS PUT TEST', ()=>{

    it('# PUT : 할일 수정(정상)', (done) =>{

        const id        = "1";
        const todo      = "TEST";
        const is_commit = "N";

        chai.request(url)
            .put('/todos')
            .send({
                id, todo, is_commit
            })
            .end( (err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('status');
                res.body.status.should.equal('success');
                res.body.should.have.property('data');

                res.body.data.should.have.property('id');
                res.body.data.should.have.property('todo');
                res.body.data.should.have.property('is_commit');

                res.body.data.id.should.equal(id);
                res.body.data.todo.should.equal(todo);
                res.body.data.is_commit.should.equal(is_commit);

                done();
            });
    });
    it('# PUT : 할일 수정(참조된 할일 확인)', (done) =>{

        const id        = "1";
        const todo      = "TEST";
        const is_commit = "Y";

        chai.request(url)
            .put('/todos')
            .send({
                id, todo, is_commit
            })
            .end( (err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('status');
                res.body.status.should.equal('error');
                res.body.should.have.property('data');
                
                done();
                console.log(res.body.data);
            });
    });
});

describe( 'TODOS POST TEST', () => {

    let new_id = "";
    it('# POST : 할일 입력(참조 없음)', (done)=>{
        const todo = "TEST 할일";
        const ref = [];

        chai.request(url)
            .post('/todos')
            .send({
                todo, ref
            })
            .end( (err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('status');
                res.body.status.should.equal('success');
                res.body.should.have.property('data'); 
                done();
                console.log("입력된 신규 ID : " , res.body.data);
            });
    }); 

    it('# POST : 할일 입력(참조 입력)', (done)=>{
        const todo = "TEST 할일";
        const ref = ["2","3"];

        chai.request(url)
            .post('/todos')
            .send({
                todo, ref
            })
            .end( (err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('status');
                res.body.status.should.equal('success');
                res.body.should.have.property('data'); 
                
                done();
                console.log("입력된 신규 ID : " , res.body.data);
            });
    }); 

    it('# POST : 할일 입력(참조 입력,존재하지 않는 ID 참조 시)', (done)=>{
        const todo = "TEST 할일";
        const ref = ["2","101"];

        chai.request(url)
            .post('/todos')
            .send({
                todo, ref
            })
            .end( (err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('status');
                res.body.status.should.equal('error');
                res.body.should.have.property('data'); 
                
                done();
                console.log("오류 메시지 : " , res.body.data);
            });
    }); 
})