import * as Helpers from "../Helpers";

export class MenuPeg {
  protected color: number;
  protected htmlElem: HTMLDivElement = document.createElement("div");

  constructor(colorIn: number) {
    this.color = colorIn;

    this.htmlElem.classList.add("menu-peg");

    this.htmlElem.style.backgroundColor = Helpers.colorList[this.color];
  }

  public getHtmlElem(): HTMLDivElement {
    return this.htmlElem;
  }
}
