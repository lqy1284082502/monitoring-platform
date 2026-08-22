// 获取所有摄像头列表接口
export interface IListOfCameras {
    // 场所
    addr: string;
    // 摄像机编码
    cameraCode: string;
    // 摄像机名称
    cameraName: string;
    // 设备提供商类型
    deviceFurnishType: string;
    // 设备状态;
    deviceStatus: number;
    //  摄像头扩展状态
    cameraStatus: number;
    // 经度
    longitude: number;
    // 纬度
    latitude: number;
    // 设备创建时间
    deviceCreateTime: string;
    // 摄像机安装位置描述
    cameraLocation: string;
}
// 请求摄像头列表接口入参
export interface ICameraListParams {
    // 当前页
    current: number;
    // 每页条数
    pageSize: number;
}
// 摄像头分页列表
export interface ICameraList {
    list: IListOfCameras[];
    total: number;
}
