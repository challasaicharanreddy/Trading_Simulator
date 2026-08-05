import {calculateSMA, calculateRSI} from '../strategies/indicators.js';

function getIndicatorValue(indicator, prices, period) {
    if(indicator==="SMA")return calculateSMA(prices,period);
    if(indicator==="RSI")return calculateRSI(prices,period);
    throw new Error(`Unknown indicator: ${indicator}`);
}

function compare(value, operator, threshold){
    if(operator==="<")return value<threshold;
    if(operator===">")return value>threshold;
    throw new Error(`Unknown operator: ${operator}`);
}

function evaluateStrategy(strategy, prices){
    const {indicator, period, operator, threshold} = strategy;

    const value=getIndicatorValue(indicator, prices, period);
    if(value===null)return false;

    return compare(value, operator, threshold);
}

export {evaluateStrategy};
