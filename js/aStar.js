

function AStartNode(pX, pY, pNumChild)
{
    this.x = pX;
    this.y = pY;
    this.pNumChild;
    this.g = -1; // cost to get from start node to this node
    this.h = -1; // estimated cost to the goal (heuristic)
    this.f = -1; // sum of g and h. Lower value equals better path
}

function AStar(pGrid, pGridWidth, pGridHeight)
{
    this.grid = pGrid;
    this.gridWidth = pWidth;
    this.gridHeight = pGridHeight;

    this.calculatePath = function calculatePath(startTile, targetTile)
    {
        this.openList = new Array();
        this.closedList = new Array();

        //assign values to starting point.

        startTile.g = 0;
        startTile.h = 0;
        startTile.f = g + h;
    }
}


