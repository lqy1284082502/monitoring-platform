import * as THREE from 'three';

export default class TextureAnimator {
    private readonly tilesHoriz: any;
    private readonly tilesVert: any;
    private readonly numTiles: any;
    private readonly tileDisplayDuration: any;
    private currentDisplayTime: any;
    private currentTile: any;
    private texture: any;

    constructor(texture: any, tilesHoriz: any, tilesVert: any, numTiles: any, tileDispDuration: any) {
        this.tilesHoriz = tilesHoriz;
        this.tilesVert = tilesVert;
        this.numTiles = numTiles;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1 / this.tilesHoriz, 1 / this.tilesVert);
        this.tileDisplayDuration = tileDispDuration;
        this.currentDisplayTime = 0;
        this.currentTile = 0;
        this.texture = texture;
    }
    update(milliSec: any) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numTiles) {
                this.currentTile = 0;
            }
            const currentColumn = this.currentTile % this.tilesHoriz;
            this.texture.offset.x = currentColumn / this.tilesHoriz;
            const currentRow = Math.floor(this.currentTile / this.tilesHoriz);
            this.texture.offset.y = currentRow / this.tilesVert;
        }
    }
}
