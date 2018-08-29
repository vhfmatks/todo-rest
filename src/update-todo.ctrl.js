
module.exports = (req, db)=>{
    return new Promise ( (resolve, reject) => {

       const { id, todo, is_commit } = req.body;

        /* 완료 여부는 Y 또는 N만 입력 가능 */
        if(is_commit !== 'Y' && is_commit !== 'N')
            reject({"status":"error", "data": `error : InputValue(is_commit : ${is_commit})`})

        /* 완료여부가 Y로 입력되면, 참조하는 할일 완료 확인 */
        if(is_commit == 'Y'){
            let sql = `select 1 exist
                         from tbtodo a
                            , tbref  b
                        where a.id = b.ref_id
                          and a.is_commit <> 'Y' 
                          and b.ori_id = ${id}`;
            let upSql = `update tbtodo
                           set is_commit = '${is_commit}'
                             , todo      = '${todo}'
                             , chng_date = datetime('now','localtime')
                         where id = ${id}`;

                         
            db.get(sql, (err, row)=>{
                if(err) reject({"status":"error", "data" : "SELECT"+err });
                else if( row == undefined ){
                    db.run(upSql, (err)=>{
                        if(err) reject({"status":"error", "data" : "UPDATE" + err});
                        resolve({"status":"success", "data" : {id,todo,is_commit} });
                    })
                }else {
                    reject({"status":"error", "data" : "참조된 할일이 완료되지 않았음" });
                }
            })
        }else {
             /* 완료여부가 Y가 아닐 경우, 완료처리 및 할일 text 수정  */
            let upSql = `update tbtodo
                           set is_commit = '${is_commit}'
                             , todo      = '${todo}'
                             , chng_date = datetime('now','localtime')
                         where id = ${id}`;
            db.run(upSql, (err)=>{
                if(err) reject({"status":"error", "data" : "UPDATE" + err});
                resolve({"status":"success", "data" : {id,todo,is_commit} });
            })
        }

    });
}