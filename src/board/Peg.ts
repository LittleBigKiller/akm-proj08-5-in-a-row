import * as Helpers from "../Helpers";

export class Peg {
  protected selected: boolean = false;
  protected blockedOff: boolean = false;
  protected color: number;
  protected htmlElem: HTMLDivElement = document.createElement("div");

  constructor(colorIn: number) {
    this.color = colorIn;

    this.htmlElem.classList.add("board-peg");

    this.htmlElem.style.backgroundColor = Helpers.colorList[this.color];
  }

  public isBlockedOff(): boolean {
    return this.blockedOff;
  }

  public isSelected(): boolean {
    return this.selected;
  }

  public getHtmlElem(): HTMLDivElement {
    return this.htmlElem;
  }

  public setSelect(val: boolean): void {
    this.selected = val;

    if (this.selected) {
      this.htmlElem.classList.add("selected");
    } else {
      this.htmlElem.classList.remove("selected");
    }
  }

  public getColor(): number {
    return this.color;
  }
}
