export interface InfoType {
    max: number;
    min: number;
    maxlng: number;
    minlng: number;
    maxlat: number;
    minlat: number;
    data: { lng: number; lat: number; value: number }[];
    size?: number;
    sizelng?: number;
    sizelat?: number;
}
export interface IPosition {
    width: number;
    height: number;
    max: number;
    min: number;
    minlng: number;
    minlat: number;
    radius: number;
    size: number;
    colors: Record<number, string>;
    data: { lng: number; lat: number; value: number }[];
}
