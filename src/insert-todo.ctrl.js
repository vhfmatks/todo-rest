
module.exports = (req, db)=>{
    return new Promise ( (resolve, reject) => {
    
        const {todo, ref} = req.body;
        const refIds = ref.toString();

        /* 참조할 ID 존재여부 조회 */
        const selectRefId = `select id
                               from tbtodo 
                              where id in (${refIds})`;
        const selectRefCnt = `select count(1) cnt
                                from tbtodo 
                               where id in (${refIds})`;                              

        /* 신규 할일 입력 */
        const  insertTodo = `insert into tbtodo (todo, reg_date, chng_date ) values ('${todo}', datetime('now','localtime'),  datetime('now','localtime'))`;
        /* 신규 입력된 ID 조회 */ 
        const selectId   = `select last_insert_rowid() id`;

        let insertRef  = ``;
        let oriId      = "";
        let refIdArray = [];

        db.serialize( () =>{
            db.run( insertTodo, (err) => {
                if(err) reject({"status":"error", "data" : "error : TODO Insert" });
            });
            db.get( selectId, (err, row)=> {
                if(err) reject({"status":"error", "data" : "error : ID Select" });
                oriId = row['id'];
            });
            db.get( selectRefCnt, (err, row)=>{
                if(err) reject({"status":"error", "data" : "error : REF_CNT Select" });
                if( Number(row['cnt']) != ref.length)
                { reject({"status":"error", "data" : `error : 참조ID 입력 오류 ${refIds}` }); }
                if( Number(row['cnt']) == 0 ) resolve({"status":"success", "data" : oriId });
            });
            db.all( selectRefId , (err, row)=>{
                if(err) reject({"status":"error", "data" : "error : REFID Select" });

                for(i in row )
                    refIdArray.push(row[i]['id']);
                
                let placeholders = refIdArray.map((values) => `(${oriId}, ?)`).join(',');
                insertRef = `insert into tbref (ori_id, ref_id) values ` + placeholders;
                
                db.run( insertRef, refIdArray, (err)=>{
                    if(err) reject({"status":"error", "data" : "error : REF Insert" });
                    resolve({"status":"success", "data" : oriId });
                });
            });
        });
    });
};