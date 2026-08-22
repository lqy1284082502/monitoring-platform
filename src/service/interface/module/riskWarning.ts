namespace RiskWarning {
    // 风险单位-出参
    export interface RiskUnitResponse {
        description: string;
        id: string;
        name: string;
        zero: string;
    }
    type IKeys = 'risk_type';
    // 指标类型-入参
    export interface IndexTypeParams {
        // 指标类型
        keys: IKeys;
    }
    // 指标类型-出参
    export type IndexTypeResponse = {
        [key in IKeys]: { label: string; text: string; title: string; value: string }[];
    };

    // 风险模型数据-出参
    export interface RiskModelResponse {
        data: { name: string; level: string; type: number; yoy: string }[];
        links: { source: string; target: string; value: number }[];
        riskLevel?: number;
        riskValue?: number;
    }
}

export default RiskWarning;
