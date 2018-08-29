
module.exports = (req, db)=>{
    return new Promise( (resolve, reject) => {

        let page  = req.query.page  == undefined ? 0 : req.query.page;
        let limit = req.query.limit == undefined ? 4 : req.query.limit;
        let offset = Number(page) * Number(limit);
        let totalCnt = 0;

        /* 전체 건수 조회 */ 
        const countSql = "select count(1) cnt from tbtodo";

        /* 할일 목록 조회 */
        const listSql  = `select a.id
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
                            offset ?`;
        db.serialize( () =>{
            db.get(countSql, (err, row) => {
                if(err) reject({"status"  : "error", "data"    : err  });
                totalCnt = Number(row['cnt']);
            });
            db.all(listSql, [limit , offset], (err, row) => {
                if(err) reject({"status"  : "error", "data"    : err  });
                let resObj = [];
                for( i in row )
                {
                    resObj.push({
                        "id"        : row[i].id,
                        "todo"      : row[i].todo,
                        "reg_date"  : row[i].reg_date,
                        "chng_date" : row[i].chng_date,
                        "is_commit" : row[i].is_commit,
                        "ref_id"    : row[i].ref_id.split(',')
                    });
                }
                resolve({"total_cnt": totalCnt , "status":"success", "data" : resObj });
            });
        });
    });
}
