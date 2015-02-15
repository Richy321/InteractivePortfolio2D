

function AStartNode(pX, pY, pNumChild)
{
    this.x = pX;
    this.y = pY;
    this.pNumChild;
    this.g = -1; // cost to get from start node to this node
    this.h = -1; // estimated cost to the goal (heuristic)
    this.f = -1; // sum of g and h. Lower value equals better path
}

function AStar(pGrid)
{
    this.grid = pGrid;
    this.gridWidth = pGrid.xTileCount;
    this.gridHeight = pGrid.yTileCount;

    this.calculatePath = function calculatePath(startPoint, targetPoint)
    {
        this.openList = new Array();
        this.closedList = new Array();

        //assign values to starting point.

        var startTile = grid.GetTileFromPosition(startPoint.x, startPoint.y);
        var targetTile = grid.GetTileFromPosition(targetPoint.x, targetPoint.y);

        var path = new Array();
        path.push(new point(targetTile.x * grid.tileWidth - grid.tileWidth * 0.5, targetTile.y * grid.tileWidth - grid.tileWidth * 0.5));

        //push exact point inside target tile
        path.push(targetPoint);

        return path;
    }
}


