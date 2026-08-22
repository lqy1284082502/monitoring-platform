// 摄像头管理
import request from '@/service/http/request.ts';
import { ICameraList, ICameraListParams } from '@/service/interface/module/cameraManagement.ts';

/**
 * 登录华为视频平台
 * */
export const loginVideoPlatform = () => {
    return request.get('/supervisory/video/login/camera/platfrom');
};
/**
 * 查看摄像头url
 * */
export const getAVideoStream = (code: string) => {
    return request.get('/supervisory/video/query/camera/flowURL', { params: { cameraCode: code } });
};

/**
 * 同步所有摄像头
 * */
export const getTheCameraList = (params: ICameraListParams) => {
    return request.post<ICameraList>('/supervisory/video/query/camera', params);
};
