import * as Helpers from "./Helpers";

import { MenuController } from "./menu/MenuContoller";
import { BoardController } from "./board/BoardController";
import { Tile } from "./board/Tile";
import { Peg } from "./board/Peg";

export class GameController {
  protected boardController: BoardController;
  protected menuController: MenuController;

  protected nextPegs: Array<number> = [];
  protected selectedPegTile: Tile | null = null;

  protected pegCheckRange: number = 5;
  protected allowMove: boolean = false;

  constructor() {
    this.boardController = new BoardController(this);
    this.menuController = new MenuController(this);
  }

  public initGame(): void {
    let boardPanel: HTMLElement | null = document.getElementById("panel-board");
    if (boardPanel != null) {
      boardPanel.innerHTML = "";
      boardPanel.appendChild(this.boardController.getHtmlElem());
    }

    this.genNextPegs();

    this.placePegs();
  }

  public getBoardController(): BoardController {
    return this.boardController;
  }

  public getMenuController(): MenuController {
    return this.menuController;
  }

  private genNextPegs(): void {
    this.nextPegs = [];

    for (let i = 0; i < 3; i++) {
      this.nextPegs.push(Helpers.getRandomInt(0, Helpers.colorList.length));
    }
  }

  public placePegs(): boolean {
    if (this.checkLossCondition()) {
      this.endGame();
      return false;
    }

    this.getBoardController().placePegs(this.nextPegs);

    this.genNextPegs();

    this.getMenuController().updateNextPegs(this.nextPegs);

    this.clearHighlights();

    return true;
  }

  public tilePegClick(clickedTile: Tile): void {
    const tileMap: Array<Array<number>> = this.genTileMap();
    const boardSize = this.boardController.getBoardSize();
    let x: number = clickedTile.getX();
    let y: number = clickedTile.getY();

    let emptyTiles = 0;
    if (x > 0) if (tileMap[x - 1][y] == -1) emptyTiles += 1;
    if (y > 0) if (tileMap[x][y - 1] == -1) emptyTiles += 1;
    if (x + 1 < boardSize) if (tileMap[x + 1][y] == -1) emptyTiles += 1;
    if (y + 1 < boardSize) if (tileMap[x][y + 1] == -1) emptyTiles += 1;

    if (emptyTiles > 0) {
      this.clearHighlights();

      if (this.selectedPegTile != null) {
        let selectedPeg = this.selectedPegTile.getPeg();
        if (selectedPeg != null) {
          selectedPeg.setSelect(false);
        }
      }

      if (clickedTile != this.selectedPegTile) {
        this.selectedPegTile = clickedTile;
        if (this.selectedPegTile != null) {
          let selectedPeg = this.selectedPegTile.getPeg();
          if (selectedPeg != null) {
            selectedPeg.setSelect(true);
          }
        }
      } else {
        if (this.selectedPegTile != null) {
          let selectedPeg = this.selectedPegTile.getPeg();
          if (selectedPeg != null) {
            selectedPeg.setSelect(false);
          }
        }
        this.selectedPegTile = null;
      }
    }
  }

  public tileEmptyClick(clickedTile: Tile): void {
    if (this.selectedPegTile != null && this.allowMove) {
      let selectedPeg = this.selectedPegTile.removePeg();
      if (selectedPeg != null) {
        clickedTile.placePeg(selectedPeg);

        this.checkPegsAtOrigin(clickedTile.getX(), clickedTile.getY());

        this.allowMove = false;
      }
    }
  }

  public tileEmptyHover(targetTile: Tile): void {
    if (this.selectedPegTile != null) {
      let foundPath: Array<Helpers.CoordSet> = this.calcPath(
        this.selectedPegTile.getX(),
        this.selectedPegTile.getY(),
        targetTile.getX(),
        targetTile.getY()
      );

      if (foundPath.length > 0) {
        this.highlightGroup(foundPath);
        this.allowMove = true;
      } else {
        this.allowMove = false;
      }
    }
  }

  private checkLossCondition(): boolean {
    let board: Array<Array<Tile>> = this.boardController.getBoard();

    let spaceCount = 0;
    for (let i in board) {
      for (let j in board[i]) {
        if (!board[i][j].hasPeg()) spaceCount += 1;
      }
    }

    return spaceCount - this.nextPegs.length <= 0;
  }

  private endGame(): void {
    window.alert(
      "Koniec gry!\n\nZdobyłeś " +
        this.menuController.getPointsValue() +
        " punktów"
    );
    window.location.reload();
  }

  public genTileMap(): Array<Array<number>> {
    let board: Array<Array<Tile>> = this.boardController.getBoard();
    let tileMap: Array<Array<number>> = [];

    for (let i in board) {
      tileMap.push([]);
      for (let j in board[i]) {
        let peg = board[i][j].getPeg();
        if (peg != null) {
          tileMap[i][j] = peg.getColor();
        } else {
          tileMap[i][j] = -1;
        }
      }
    }

    return tileMap;
  }

  public checkPegsAtOrigin(
    x: number,
    y: number,
    blockUpdate: boolean = false
  ): void {
    const tileMap: Array<Array<number>> = this.genTileMap();

    let xOrigin;
    let yOrigin;
    let i;
    const boardSize = this.boardController.getBoardSize();

    let toMatch: number = tileMap[x][y];

    let matchedTiles: Array<Helpers.CoordSet> = [];

    // Check diagonal down
    xOrigin = x;
    yOrigin = y;
    i = -1;
    while (i < boardSize) {
      i++;
      if (x - i < 0) continue;
      if (y - i < 0) continue;
      if (tileMap[x - i][y - i] != toMatch) break;

      xOrigin = x - i;
      yOrigin = y - i;
    }

    let checkDiagDown = this.checkDiagDown(xOrigin, yOrigin, toMatch);
    if (checkDiagDown != null) {
      matchedTiles = matchedTiles.concat(checkDiagDown);
    }

    // Check diagonal up
    xOrigin = x;
    yOrigin = y;
    i = -1;
    while (x + i < boardSize && i < boardSize) {
      i++;
      if (x + i >= boardSize) continue;
      if (y - i < 0) continue;
      if (tileMap[x + i][y - i] != toMatch) break;

      xOrigin = x + i;
      yOrigin = y - i;
    }

    let checkDiagUp = this.checkDiagUp(xOrigin, yOrigin, toMatch);
    if (checkDiagUp != null) {
      matchedTiles = matchedTiles.concat(checkDiagUp);
    }

    // Check horizontal
    xOrigin = x;
    yOrigin = y;
    i = -1;
    while (i < boardSize) {
      i++;
      if (y - i < 0) continue;
      if (tileMap[x][y - i] != toMatch) break;

      xOrigin = x;
      yOrigin = y - i;
    }

    let checkHoriz = this.checkHoriz(xOrigin, yOrigin, toMatch);
    if (checkHoriz != null) {
      matchedTiles = matchedTiles.concat(checkHoriz);
    }

    // Check vertical
    xOrigin = x;
    yOrigin = y;
    i = -1;
    while (i < boardSize) {
      i++;
      if (x - i < 0) continue;
      if (tileMap[x - i][y] != toMatch) break;

      xOrigin = x - i;
      yOrigin = y;
    }

    let checkVert = this.checkVert(xOrigin, yOrigin, toMatch);
    if (checkVert != null) {
      matchedTiles = matchedTiles.concat(checkVert);
    }

    let tilesCleared = this.clearTiles(matchedTiles);

    if (!tilesCleared && !blockUpdate) {
      this.placePegs();
    }
  }

  // #region Check Helpers
  private checkDiagDown(
    x: number,
    y: number,
    toMatch: number
  ): Array<Helpers.CoordSet> | null {
    let tileMap: Array<Array<number>> = this.genTileMap();

    let matchedTiles: Array<Helpers.CoordSet> = [];

    let i = 0;
    let boardSize = this.boardController.getBoardSize();
    while (x + i < boardSize && y + i < boardSize) {
      if (tileMap[x + i][y + i] == toMatch) {
        matchedTiles.push(new Helpers.CoordSet(x + i, y + i));
        i++;
      } else {
        break;
      }
    }

    if (matchedTiles.length >= this.pegCheckRange) {
      return matchedTiles;
    } else {
      return null;
    }
  }

  private checkDiagUp(
    x: number,
    y: number,
    toMatch: number
  ): Array<Helpers.CoordSet> | null {
    let tileMap: Array<Array<number>> = this.genTileMap();

    let matchedTiles: Array<Helpers.CoordSet> = [];

    let i = 0;
    let boardSize = this.boardController.getBoardSize();
    while (i < boardSize && y + i < boardSize) {
      if (x - i < 0) break;
      if (tileMap[x - i][y + i] == toMatch) {
        matchedTiles.push(new Helpers.CoordSet(x - i, y + i));
        i++;
      } else {
        break;
      }
    }

    if (matchedTiles.length >= this.pegCheckRange) {
      return matchedTiles;
    } else {
      return null;
    }
  }

  private checkHoriz(
    x: number,
    y: number,
    toMatch: number
  ): Array<Helpers.CoordSet> | null {
    let tileMap: Array<Array<number>> = this.genTileMap();

    let matchedTiles: Array<Helpers.CoordSet> = [];

    let i = 0;
    let boardSize = this.boardController.getBoardSize();
    while (y + i < boardSize) {
      if (tileMap[x][y + i] == toMatch) {
        matchedTiles.push(new Helpers.CoordSet(x, y + i));
        i++;
      } else {
        break;
      }
    }

    if (matchedTiles.length >= this.pegCheckRange) {
      return matchedTiles;
    } else {
      return null;
    }
  }

  private checkVert(
    x: number,
    y: number,
    toMatch: number
  ): Array<Helpers.CoordSet> | null {
    let tileMap: Array<Array<number>> = this.genTileMap();

    let matchedTiles: Array<Helpers.CoordSet> = [];

    let i = 0;
    let boardSize = this.boardController.getBoardSize();
    while (x + i < boardSize) {
      if (tileMap[x + i][y] == toMatch) {
        matchedTiles.push(new Helpers.CoordSet(x + i, y));
        i++;
      } else {
        break;
      }
    }

    if (matchedTiles.length >= this.pegCheckRange) {
      return matchedTiles;
    } else {
      return null;
    }
  }
  // #endregion

  public clearTiles(coordArray: Array<Helpers.CoordSet>): boolean {
    let board: Array<Array<Tile>> = this.boardController.getBoard();
    let pointCounter: number = 0;

    coordArray.map((coordSet: Helpers.CoordSet) => {
      let status: Peg | null = board[coordSet.x][coordSet.y].removePeg();

      if (status != null) {
        pointCounter += 1;
      }
    });

    this.menuController.addPoints(pointCounter);

    this.selectedPegTile = null;

    this.clearHighlights();

    return pointCounter > 0;
  }

  public clearHighlights(): void {
    let board: Array<Array<Tile>> = this.boardController.getBoard();
    board.map((row: Array<Tile>) => {
      row.map((tile: Tile) => {
        tile.highlight(false);
      });
    });
  }

  public highlightGroup(coordArray: Array<Helpers.CoordSet>): void {
    let board: Array<Array<Tile>> = this.boardController.getBoard();

    coordArray.map((coordSet: Helpers.CoordSet) => {
      let tile: Tile = board[coordSet.x][coordSet.y];

      tile.highlight(true);
    });
  }

  public calcPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ): Array<Helpers.CoordSet> {
    this.clearHighlights();

    let board: Array<Array<Tile>> = this.boardController.getBoard();

    let tileMap: Array<Array<number>> = [];
    let entryMap: Array<Array<Array<Helpers.CoordSet>>> = [];

    let pathTiles: Array<Helpers.CoordSet> = [];

    let currentMarker: number = -1;
    let keepSearching: boolean = true;
    let keepCalculating: boolean = true;
    const boardSize: number = this.boardController.getBoardSize();

    for (let i in board) {
      tileMap.push([]);
      entryMap.push([]);
      for (let j in board[i]) {
        let peg = board[i][j].getPeg();
        if (i == startX.toString() && j == startY.toString()) {
          tileMap[i][j] = -1;
        } else if (i == targetX.toString() && j == targetY.toString()) {
          tileMap[i][j] = -2;
        } else if (peg != null) {
          tileMap[i][j] = -5;
        } else {
          tileMap[i][j] = 0;
        }
        entryMap[i][j] = [];
      }
    }

    let noNew: boolean = false;

    while (keepSearching && !noNew) {
      let edges: Array<Helpers.CoordSet> = [];

      tileMap.map((row: Array<number>, x) => {
        row.map((navData: number, y) => {
          if (navData == currentMarker) {
            edges.push(new Helpers.CoordSet(x, y));
          }
        });
      });

      if (currentMarker == -1) {
        currentMarker = 1;
      } else {
        currentMarker += 1;
      }

      let newEdgeCount: number = 0;

      edges.map(edge => {
        if (edge.x > 0) {
          if (tileMap[edge.x - 1][edge.y] == -2) {
            keepSearching = false;
            newEdgeCount += 1;
          } else if (tileMap[edge.x - 1][edge.y] == 0) {
            tileMap[edge.x - 1][edge.y] = currentMarker;
            newEdgeCount += 1;
          }
        }

        if (edge.y + 1 < boardSize) {
          if (tileMap[edge.x][edge.y + 1] == -2) {
            keepSearching = false;
            newEdgeCount += 1;
          } else if (tileMap[edge.x][edge.y + 1] == 0) {
            tileMap[edge.x][edge.y + 1] = currentMarker;
            newEdgeCount += 1;
          }
        }

        if (edge.x + 1 < boardSize) {
          if (tileMap[edge.x + 1][edge.y] == -2) {
            keepSearching = false;
            newEdgeCount += 1;
          } else if (tileMap[edge.x + 1][edge.y] == 0) {
            tileMap[edge.x + 1][edge.y] = currentMarker;
            newEdgeCount += 1;
          }
        }

        if (edge.y > 0) {
          if (tileMap[edge.x][edge.y - 1] == -2) {
            keepSearching = false;
            newEdgeCount += 1;
          } else if (tileMap[edge.x][edge.y - 1] == 0) {
            tileMap[edge.x][edge.y - 1] = currentMarker;
            newEdgeCount += 1;
          }
        }
      });

      if (newEdgeCount == 0 && keepSearching) {
        noNew = true;
      }
    }

    currentMarker = -1;

    while (keepCalculating && !noNew) {
      let edges: Array<Helpers.CoordSet> = [];

      tileMap.map((row: Array<number>, x) => {
        row.map((navData: number, y) => {
          if (navData == currentMarker) {
            edges.push(new Helpers.CoordSet(x, y));
          }
        });
      });

      if (currentMarker == -1) {
        currentMarker = 1;
      } else {
        currentMarker += 1;
      }

      edges.map(edge => {
        if (edge.x > 0) {
          if (tileMap[edge.x - 1][edge.y] == -2 && keepCalculating) {
            entryMap[edge.x - 1][edge.y] = entryMap[edge.x - 1][edge.y].concat(
              entryMap[edge.x][edge.y]
            );
            entryMap[edge.x - 1][edge.y].push(
              new Helpers.CoordSet(edge.x - 1, edge.y)
            );
            keepCalculating = false;
            pathTiles = entryMap[edge.x - 1][edge.y];
          }
          if (tileMap[edge.x - 1][edge.y] == currentMarker) {
            if (entryMap[edge.x - 1][edge.y].length < currentMarker) {
              entryMap[edge.x - 1][edge.y] = entryMap[edge.x - 1][
                edge.y
              ].concat(entryMap[edge.x][edge.y]);
              entryMap[edge.x - 1][edge.y].push(
                new Helpers.CoordSet(edge.x - 1, edge.y)
              );
            }
          }
        }

        if (edge.y + 1 < boardSize) {
          if (tileMap[edge.x][edge.y + 1] == -2 && keepCalculating) {
            entryMap[edge.x][edge.y + 1] = entryMap[edge.x][edge.y + 1].concat(
              entryMap[edge.x][edge.y]
            );
            entryMap[edge.x][edge.y + 1].push(
              new Helpers.CoordSet(edge.x, edge.y + 1)
            );
            keepCalculating = false;
            pathTiles = entryMap[edge.x][edge.y + 1];
          }
          if (tileMap[edge.x][edge.y + 1] == currentMarker) {
            if (entryMap[edge.x][edge.y + 1].length < currentMarker) {
              entryMap[edge.x][edge.y + 1] = entryMap[edge.x][
                edge.y + 1
              ].concat(entryMap[edge.x][edge.y]);
              entryMap[edge.x][edge.y + 1].push(
                new Helpers.CoordSet(edge.x, edge.y + 1)
              );
            }
          }
        }

        if (edge.x + 1 < boardSize) {
          if (tileMap[edge.x + 1][edge.y] == -2 && keepCalculating) {
            entryMap[edge.x + 1][edge.y] = entryMap[edge.x + 1][edge.y].concat(
              entryMap[edge.x][edge.y]
            );
            entryMap[edge.x + 1][edge.y].push(
              new Helpers.CoordSet(edge.x + 1, edge.y)
            );
            keepCalculating = false;
            pathTiles = entryMap[edge.x + 1][edge.y];
          }
          if (tileMap[edge.x + 1][edge.y] == currentMarker) {
            if (entryMap[edge.x + 1][edge.y].length < currentMarker) {
              entryMap[edge.x + 1][edge.y] = entryMap[edge.x + 1][
                edge.y
              ].concat(entryMap[edge.x][edge.y]);
              entryMap[edge.x + 1][edge.y].push(
                new Helpers.CoordSet(edge.x + 1, edge.y)
              );
            }
          }
        }

        if (edge.y > 0) {
          if (tileMap[edge.x][edge.y - 1] == -2 && keepCalculating) {
            entryMap[edge.x][edge.y - 1] = entryMap[edge.x][edge.y - 1].concat(
              entryMap[edge.x][edge.y]
            );
            entryMap[edge.x][edge.y - 1].push(
              new Helpers.CoordSet(edge.x, edge.y - 1)
            );
            keepCalculating = false;
            pathTiles = entryMap[edge.x][edge.y - 1];
          }
          if (tileMap[edge.x][edge.y - 1] == currentMarker) {
            if (entryMap[edge.x][edge.y - 1].length < currentMarker) {
              entryMap[edge.x][edge.y - 1] = entryMap[edge.x][
                edge.y - 1
              ].concat(entryMap[edge.x][edge.y]);
              entryMap[edge.x][edge.y - 1].push(
                new Helpers.CoordSet(edge.x, edge.y - 1)
              );
            }
          }
        }
      });
    }

    if (!noNew) pathTiles.unshift(new Helpers.CoordSet(startX, startY));

    return pathTiles;
  }
}
