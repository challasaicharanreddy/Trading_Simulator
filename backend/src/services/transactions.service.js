import transactions from "../models/transactions.js";

export default async function(userid) {
    const data=await transactions.find({user:userid}).sort({executedAt:-1});
    let buyorders=0;
    let sellorders=0;
    let totalvolume=0;
    for(const transaction of data) {
        if(transaction.action=="BUY") {
            buyorders++;
        }else{
            sellorders++;
        }
        totalvolume+=(transaction.quantity*transaction.price);
    }
    return {
        totalorders:(buyorders+sellorders),
        buyorders,
        sellorders,
        avgtradesize:data.length>0?(totalvolume/data.length):0,
        record:data
    }
}