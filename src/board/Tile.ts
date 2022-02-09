import { Peg } from "./Peg";
import { BoardController } from "./BoardController";

export class Tile {
  protected boardController: BoardController;
  protected posX: number;
  protected posY: number;

  protected peg: Peg | null = null;
  protected htmlElem: HTMLDivElement = document.createElement("div");

  constructor(bc: BoardController, yIn: number, xIn: number) {
    this.boardController = bc;

    this.posX = xIn;
    this.posY = yIn;

    this.htmlElem.classList.add("board-tile");
    this.htmlElem.addEventListener("click", e => {
      this.htmlOnClick();
    });

    this.htmlElem.addEventListener("mouseover", e => {
      this.htmlOnHover();
    });
  }

  public getX(): number {
    return this.posX;
  }

  public getY(): number {
    return this.posY;
  }

  public getHtmlElem(): HTMLDivElement {
    return this.htmlElem;
  }

  public getPeg(): Peg | null {
    return this.peg;
  }

  public hasPeg(): boolean {
    return this.peg != null;
  }

  public htmlOnClick(): void {
    // console.log(this.getX() + " - " + this.getY());

    if (this.peg != null) {
      this.boardController.getGameController().tilePegClick(this);
    } else {
      this.boardController.getGameController().tileEmptyClick(this);
    }
  }

  public htmlOnHover(): void {
    if (this.peg == null) {
      this.boardController.getGameController().tileEmptyHover(this);
    }
  }

  public placePeg(pegIn: Peg): number {
    if (!this.hasPeg()) {
      this.peg = pegIn;
      this.htmlElem.appendChild(this.peg.getHtmlElem());
    } else {
      return -1;
    }

    return 0;
  }

  public removePeg(): Peg | null {
    if (this.peg != null) {
      let peg = new Peg(this.peg.getColor());
      this.peg = null;

      this.getHtmlElem().innerHTML = "";

      return peg;
    } else {
      return null;
    }
  }

  public highlight(boolean: boolean) {
    if (boolean) {
      this.htmlElem.style.backgroundColor = "#CF2F2F";
    } else {
      this.htmlElem.removeAttribute("style");
    }
  }

  public getBoardController(): BoardController {
    return this.boardController;
  }
}
