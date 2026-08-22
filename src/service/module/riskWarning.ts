import RiskWarning from '@/service/interface/module/riskWarning.ts';
// 风险预警
import request from '@/service/http/request.ts';

/**
 * 获取风险模型数据
 * */
export const getRiskModel = () => {
    return request.get<RiskWarning.RiskModelResponse>('/risk/analysis/model');
};

/**
 * 获取风险单位数据
 * */
export const getRiskUnit = () => {
    return request.get<RiskWarning.RiskUnitResponse[]>('/model/common/department');
};

/**
 * 获取指标类型数据
 * */
export const getIndexType = (params: RiskWarning.IndexTypeParams) => {
    return request.get<RiskWarning.IndexTypeResponse>('/model/common/dict', {
        params,
    });
};
/**
 * 获取风险预警数据
 * */
export const getRiskWarning = (params: object) => {
    return request.post('/risk/analysis/warn', params);
};
