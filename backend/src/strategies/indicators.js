function calculateSMA(prices,period){
    if(prices.length<period)return null;
    const relevant=prices.slice(-period);
    return relevant.reduce((sum,p)=> sum+p, 0)/period;
}

function calculateRSI(prices,period){
    if(prices.length<period+1)return null;
    const relevant=prices.slice(-(period+1));
    let gains=0;
    let losses=0;

    for(let i=1;i<relevant.length;i++){
        const change=relevant[i]-relevant[i-1];
        if(change>0) gains+=change;
        else losses+=Math.abs(change);

        const avgGain=gains/period;
        const avgLoss=losses/period;

        if(avgLoss===0)return 100;
        const rs=avgGain/avgLoss;
        return (100-(100/(1+rs)));
    }

}
export {calculateSMA,calculateRSI};