import { geoMercator } from 'd3-geo';

export type GeoCoordinate = [number, number];

export function createMercatorProjection({
    center = [103.846, 35.832],
    scale = 1000,
    translate = [0, 0],
}: Partial<{ center: GeoCoordinate; scale: number; translate: GeoCoordinate }> = {}) {
    return geoMercator().center(center).scale(scale).translate(translate);
}
