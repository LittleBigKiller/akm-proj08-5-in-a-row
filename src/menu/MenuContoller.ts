import * as Helpers from "../Helpers";

import { GameController } from "../GameController";

import { MenuPeg } from "./MenuPeg";

export class MenuController {
  private gameController: GameController;

  protected htmlNextValue: HTMLElement | null;
  protected htmlPointsValue: HTMLElement | null;

  protected pointsValue: number = 0;

  constructor(gc: GameController) {
    this.gameController = gc;

    this.htmlNextValue = document.getElementById("menu-next-value");
    this.htmlPointsValue = document.getElementById("menu-points-value");

    this.updatePointsDisplay();
  }

  public setPointsValue(value: number): void {
    this.pointsValue = value;
  }

  public addPoints(value: number): void {
    this.pointsValue += value;

    this.updatePointsDisplay();
  }

  public updatePointsDisplay(): void {
    if (this.htmlPointsValue != null) {
      this.htmlPointsValue.innerHTML = this.pointsValue.toString();
    } else {
      console.error("MenuController.htmlPointsValue is null");
    }
  }

  public getPointsValue(): number {
    return this.pointsValue;
  }

  public updateNextPegs(nextPegArray: Array<number>): void {
    if (this.htmlNextValue != null) {
      this.htmlNextValue.innerHTML = "";
    } else {
      console.error("MenuController.htmlPointsValue is null");
    }

    nextPegArray.map((colorId: number) => {
      if (this.htmlNextValue != null) {
        let newPeg = new MenuPeg(colorId);
        this.htmlNextValue.appendChild(newPeg.getHtmlElem());
      } else {
        console.error("MenuController.htmlPointsValue is null");
      }
    });
  }

  public getGameController(): GameController {
    return this.gameController;
  }
}
