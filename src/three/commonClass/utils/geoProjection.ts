import * as d3 from 'd3';

export type GeoCoordinate = [number, number];

export function createMercatorProjection({
    center = [103.846, 35.832],
    scale = 1000,
    translate = [0, 0],
}: Partial<{ center: GeoCoordinate; scale: number; translate: GeoCoordinate }> = {}) {
    return d3.geoMercator().center(center).scale(scale).translate(translate);
}
