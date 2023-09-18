function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

class Cell {
    private _state: boolean
    private _neighbors: Cell[]

    constructor(state: boolean = false, neighbors: Cell[] = new Array(8)) {
        this._state = state
        this._neighbors = neighbors
    }

    getState(): boolean {
        return this._state
    }

    getNeighbors(): Cell[] {
        return this._neighbors
    }

    setState(state: boolean): void {
        this._state = state
    }

    setNeighbors(neighbors: Cell[]): void {
        this._neighbors = neighbors
    }

    numberOfLivingNeighbors(): number {
        let count: number = 0

        for (let i: number = 0; i < this._neighbors.length; i++) {
            if (this._neighbors[i].getState() == true) {
                count++
            }
        }

        return count
    }
}

class GameField {
    private _width: number
    private _height: number
    private _arrLength: number
    private _currGen: Cell[]
    private _nextGen: boolean[]
    private _prevStates: boolean[][]

    constructor(width = getRandomInt(10, 100), height = getRandomInt(10, 100)) {
        this._width = width
        this._height = height
        this._arrLength = width * height
        this._currGen = new Array(this._arrLength)
        this._nextGen = new Array(this._arrLength)
        this._prevStates = []
        this._generateGameField()
    }

    private _generateCellState(): boolean {
        return Math.round(Math.random()) == 1 ? true : false
    }

    private _generateGameField(): void {
        for (let i: number = 0; i < this._arrLength; i++) {
            this._currGen[i] = new Cell()
            this._nextGen[i] = false
        }

        for (let i: number = 0; i < this._arrLength; i++) {
            let currCell: Cell = this._currGen[i]
            currCell.setState(this._generateCellState())
            this._getNeighborsByCurrentCell(i, currCell.getNeighbors())
        }
    }

    private _getSeparator(index: number): string {

        let pos: number = index % this._width
        return pos == this._width - 1 ? '\n\t' : ''
    }

    private _getCellByXYCoord(x: number, y: number): Cell {
        return this._currGen[x + y * this._width]
    }

    showGameField(): void {
        let info: string = ''
        for (let i: number = 0; i < this._arrLength; i++) {
            info += (this._currGen[i].getState() == true ? '(*)' : '( )') + this._getSeparator(i)
        }
        console.log(info)
    }

    checkIsDead(): boolean {
        for (let i: number = 0; i < this._arrLength; i++) {
            if (this._currGen[i].getState() == true) {
                return false
            }
        }

        return true
    }

    checkStatus(): boolean {
        let flag: boolean = true
        for (let i: number = this._prevStates.length - 1; i >= 0; i--) {
            flag = true
            for (let j: number = 0; j < this._arrLength; j++) {
                if (this._currGen[j].getState() != this._prevStates[i][j]) {
                    flag = false
                    break
                }
            }
            if (flag == true) {
                return flag
            }
        }

        return false
    }

    private _getNeighborsByCurrentCell(index: number, neighbors: Cell[]): void {
        let x: number = index % this._width
        let y: number = Math.floor(index / this._width)

        neighbors[0] = this._getCellByXYCoord((x == 0 ? this._width - 1 : x - 1), (y == 0 ? this._height - 1 : y - 1))
        neighbors[1] = this._getCellByXYCoord(x, (y == 0 ? this._height - 1 : y - 1))
        neighbors[2] = this._getCellByXYCoord((x == this._width - 1 ? 0 : x + 1), (y == 0 ? this._height - 1 : y - 1))
        neighbors[3] = this._getCellByXYCoord((x == 0 ? this._width - 1 : x - 1), y)
        neighbors[4] = this._getCellByXYCoord((x == this._width - 1 ? 0 : x + 1), y)
        neighbors[5] = this._getCellByXYCoord((x == 0 ? this._width - 1 : x - 1), (y == this._height - 1 ? 0 : y + 1))
        neighbors[6] = this._getCellByXYCoord(x, (y == this._height - 1 ? 0 : y + 1))
        neighbors[7] = this._getCellByXYCoord((x == this._width - 1 ? 0 : x + 1), (y == this._height - 1 ? 0 : y + 1))
    }

    private _savePrevState(): void {
        if (this._prevStates.length < 10) {
            let prevState: boolean[] = new Array(this._arrLength)
            for (let i: number = 0; i < this._arrLength; i++) {
                prevState[i] = this._currGen[i].getState()
            }
            this._prevStates.push(prevState)
        }
        else {
            let firstState: any = this._prevStates.shift()
            for (let i: number = 0; i < this._arrLength; i++) {
                firstState[i] = this._currGen[i].getState()
            }
            this._prevStates.push(firstState)
        }
    }

    private _copyFromNextGenToOldGen(): void {
        this._savePrevState()
        for (let i: number = 0; i < this._arrLength; i++) {
            this._currGen[i].setState(this._nextGen[i])
        }
    }

    private _doProcessNextGen(): void {
        for (let i: number = 0; i < this._arrLength; i++) {
            let currCell: Cell = this._currGen[i]
            let numOfLivingNeighbors: number = currCell.numberOfLivingNeighbors()

            if (currCell.getState() == true) {
                if (numOfLivingNeighbors < 2 || numOfLivingNeighbors > 3) {
                    this._nextGen[i] = false
                }
            }
            else {
                if (numOfLivingNeighbors == 3) {
                    this._nextGen[i] = true
                }
            }
        }
    }

    process(): void {
        this._doProcessNextGen()
        this._copyFromNextGenToOldGen()
    }
}

class GameOfLive {
    private _gameField: GameField

    constructor(width: number = 0, height: number = 0) {
        if (width == 0 && height == 0) {
            this._gameField = new GameField()
        }
        else {
            this._gameField = new GameField(width, height)
        }
    }

    private _checkConditions(): boolean {
        let checkIsDead: boolean = this._gameField.checkIsDead()
        if (checkIsDead == false) {
            return !this._gameField.checkStatus()
        }
        return !checkIsDead
    }

    play(): void {
        console.log("Start game...")
        this._gameField.showGameField()
        while (this._checkConditions()) {
            this._gameField.process()
            this._gameField.showGameField()
        }
        console.log("Game over...")
    }
}

let game = new GameOfLive(10, 10)
game.play()