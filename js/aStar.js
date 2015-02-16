

function AStarNode(pParent, pPoint)
{
    this.x = pPoint.x;
    this.y = pPoint.y;
    this.parent = pParent;
    this.g = 0; // cost to get from start node to this node
    this.f = 0; // sum of g and h. Lower value equals better path
}

function AStar(pGrid)
{
    this.grid = pGrid;
    this.gridWidth = pGrid.xTileCount;
    this.gridHeight = pGrid.yTileCount;

    this.ManhattanDistance = function ManhattanDistance(point, target)
    {
        return Math.abs(point.x - target.x) + Math.abs(point.y - target.y);
    }

    this.EuclideanDistance = function EuclideanDistance(point, target)
    {
        return Math.sqrt(Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2));
    }

    this.CanWalkhere = function CanWalkhere(x, y)
    {
        var tile = grid.getTile(x, y);
        return ((tile != null) && tile.walkable == true);
    }

    this.NeighboursNESW = function neighbours(x, y)
    {
        var N = y - 1;
        var E = x + 1;
        var S = y + 1;
        var W = x - 1;

        var result = [];

        if (this.CanWalkhere(x, N))
            result.push(new point(x, N));
        if (this.CanWalkhere(E, y))
            result.push(new point(E, y));
        if (this.CanWalkhere(x, S))
            result.push(new point(x, S));
        if (this.CanWalkhere(W, y))
            result.push(new point(W, y));

        return result;
    }

    this.calculatePath = function calculatePath(startPoint, targetPoint)
    {
        var openList = new Array();
        var closedList = new Array();
        var distanceFunction = this.ManhattanDistance;

        var startTile = grid.GetTileFromPosition(startPoint.x, startPoint.y);
        var targetTile = grid.GetTileFromPosition(targetPoint.x, targetPoint.y);
        var startNode = new AStarNode(null, new point(startTile.x, startTile.y));
        var targetNode = new AStarNode(null, new point(targetTile.x, targetTile.y));

        var path = new Array();
        var nodePath;
        var currentNeighbours;
        var currentNode;

        var worldWidth = grid.xTileCount;
        var worldHeight = grid.yTileCount;
        var worldSize =	worldWidth * worldHeight;
        var worldNodes = new Array(worldSize);
        openList.push(startNode);

        var length, max, min, i, j;

        while (length = openList.length)
        {
            max = worldSize;
            min = -1;
            for (i = 0; i < length; i++)
            {
                if (openList[i].f < max)
                {
                    max = openList[i].f;
                    min = i;
                }
            }

            currentNode = openList.splice(min, 1)[0];

            //at target?
            if (currentNode.x == targetNode.x && currentNode.y == targetNode.y) {
                nodePath = closedList[closedList.push(currentNode) - 1];
                do {
                    //push center of tile to path array
                    path.push(new point(currentNode.x * grid.tileWidth + grid.tileWidth * 0.5,
                        currentNode.y * grid.tileWidth + grid.tileWidth * 0.5));

                }
                while (currentNode = currentNode.parent);
                openList = closedList = worldNodes = [];
                path.reverse();
            }
            else
            {
                //nope not at target
                currentNeighbours = this.NeighboursNESW(currentNode.x, currentNode.y);

                for (var i = 0; i < currentNeighbours.length; i++)
                {
                    nodePath = new AStarNode(currentNode, currentNeighbours[i]);
                    var linearArrayPos = (nodePath.y * grid.xTileCount) + nodePath.x;
                    if (!worldNodes[linearArrayPos])
                    {
                        nodePath.g = currentNode.g + distanceFunction(currentNeighbours[i], currentNode);

                        nodePath.f = nodePath.g + distanceFunction(currentNeighbours[i], targetNode);

                        openList.push(nodePath);

                        worldNodes[linearArrayPos] = true;
                    }
                }

                closedList.push(currentNode);
            }
        }


        

        /*
        //Direct path
        var startTile = grid.GetTileFromPosition(startPoint.x, startPoint.y);
        var targetTile = grid.GetTileFromPosition(targetPoint.x, targetPoint.y);

        
        path.push(new point(targetTile.x * grid.tileWidth - grid.tileWidth * 0.5,
            targetTile.y * grid.tileWidth - grid.tileWidth * 0.5));
        */

        //push exact point inside target tile
        if(targetTile.walkable == true)
            path.push(targetPoint);
        return path;
    }
}


