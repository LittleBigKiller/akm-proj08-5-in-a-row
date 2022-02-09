import * as Helpers from "../Helpers";

import { GameController } from "../GameController";

import { Tile } from "./Tile";
import { Peg } from "./Peg";

export class BoardController {
  private gameController: GameController;

  protected boardSize: number = 9;
  protected board: Array<Array<Tile>> = [];
  protected htmlElem: HTMLDivElement = document.createElement("div");

  constructor(gc: GameController) {
    this.gameController = gc;

    this.htmlElem.classList.add("board-cont");

    for (let i = 0; i < this.boardSize; i++) {
      this.board.push([]);
      for (let j = 0; j < this.boardSize; j++) {
        let tempTile: Tile = new Tile(this, j, i);

        this.board[i].push(tempTile);
        this.htmlElem.appendChild(tempTile.getHtmlElem());
      }
    }
  }

  public getBoard(): Array<Array<Tile>> {
    return this.board;
  }

  public getBoardSize(): number {
    return this.boardSize;
  }

  public placePegs(nextPegArray: Array<number>): void {
    let coordSets: Array<Helpers.CoordSet> = [];

    for (let i = 0; i < nextPegArray.length; i++) {
      let newSet: Helpers.CoordSet;

      do {
        newSet = Helpers.randomCoords(this.boardSize);
      } while (
        Helpers.isObjInArray(newSet, coordSets) ||
        this.board[newSet.y][newSet.x].hasPeg()
      );

      coordSets.push(newSet);
    }

    coordSets.map((set: Helpers.CoordSet, i) => {
      this.board[set.y][set.x].placePeg(new Peg(nextPegArray[i]));
      
      this.gameController.checkPegsAtOrigin(set.y, set.x, true);
    });
  }

  public getHtmlElem(): HTMLElement {
    return this.htmlElem;
  }

  public getGameController(): GameController {
    return this.gameController;
  }
}
