

function AStarNode(pParent, pPoint)
{
    this.x = pPoint.x;
    this.y = pPoint.y;
    this.parent = pParent;
    this.g = 0; // cost to get from start node to this node
    this.f = 0; // sum of g and h. Lower value equals better path
    this.h = 99999;
}

//The player's collision footprint, matching Player.getBounds: a box the sprite's
//width, covering the feet. Line of sight is tested with this rather than a bare
//point so a shortcut is only taken where the character can actually fit. Half
//width is a pixel under the real 21 so that standing centred on a walkable tile
//is never itself judged blocked.
var PATH_FOOTPRINT_HALF_WIDTH = 20;
var PATH_FOOTPRINT_HEIGHT = 12;

function AStar(pGrid)
{
    this.grid = pGrid;
    this.gridWidth = pGrid.xTileCount;
    this.gridHeight = pGrid.yTileCount;

    function ManhattanDistance(point, target)
    {
        return Math.abs(point.x - target.x) + Math.abs(point.y - target.y);
    }

    function EuclideanDistance(point, target)
    {
        return Math.sqrt(Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2));
    }

    function CanWalkhere(x, y)
    {
        var tile = grid.getTile(x, y);
        return ((tile != null) && tile.walkable == true);
    }

    function NeighboursNESW(x, y)
    {
        var N = y - 1;
        var E = x + 1;
        var S = y + 1;
        var W = x - 1;

        var result = [];

        if (CanWalkhere(x, N))
            result.push(new point(x, N));
        if (CanWalkhere(E, y))
            result.push(new point(E, y));
        if (CanWalkhere(x, S))
            result.push(new point(x, S));
        if (CanWalkhere(W, y))
            result.push(new point(W, y));

        return result;
    }

    function CanWalkAtPosition(x, y)
    {
        var tile = grid.GetTileFromPosition(x, y);
        return ((tile != null) && tile.walkable == true);
    }

    //The footprint spans at most two tiles on each axis, so its corners between
    //them cover every tile it can touch.
    function IsFootprintWalkable(centreX, centreY)
    {
        var left = centreX - PATH_FOOTPRINT_HALF_WIDTH;
        var right = centreX + PATH_FOOTPRINT_HALF_WIDTH;
        var top = centreY;
        var bottom = centreY + PATH_FOOTPRINT_HEIGHT;

        return CanWalkAtPosition(left, top) && CanWalkAtPosition(right, top) &&
               CanWalkAtPosition(left, bottom) && CanWalkAtPosition(right, bottom);
    }

    function HasClearLine(from, to)
    {
        var deltaX = to.x - from.x;
        var deltaY = to.y - from.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance == 0)
            return true;

        //A quarter tile apart: close enough that the footprint cannot straddle a
        //wall without one of the samples landing on it.
        var steps = Math.ceil(distance / (grid.tileWidth * 0.25));

        for (var step = 1; step <= steps; step++)
        {
            var along = step / steps;

            if (!IsFootprintWalkable(from.x + deltaX * along, from.y + deltaY * along))
                return false;
        }

        return true;
    }

    //String pulling. The search can only step N/E/S/W, so it returns a staircase
    //of tile centres, which is what made following a path feel like steps rather
    //than walking. Keep only the waypoints that are needed: if the character can
    //see a later waypoint in a straight line, everything between is dropped.
    //Anchoring the first segment on the player's real position also removes the
    //backwards step onto the centre of the tile they are already standing on.
    function SmoothPath(startPoint, path)
    {
        if (path == null || path.length < 2)
            return path;

        var smoothed = new Array();
        var anchor = new point(startPoint.x, startPoint.y);
        var index = 0;

        while (index < path.length)
        {
            var furthest = index;

            for (var candidate = path.length - 1; candidate > index; candidate--)
            {
                if (HasClearLine(anchor, path[candidate]))
                {
                    furthest = candidate;
                    break;
                }
            }

            smoothed.push(path[furthest]);
            anchor = path[furthest];

            if (furthest == path.length - 1)
                break;

            index = furthest + 1;
        }

        return smoothed;
    }

    this.calculatePath = function calculatePath(startPoint, targetPoint)
    {
        return SmoothPath(startPoint, calculateRawPath(startPoint, targetPoint));
    }

    function calculateRawPath(startPoint, targetPoint)
    {
        var openList = new Array();
        var closedList = new Array();
        var distanceFunction = ManhattanDistance;

        var startTile = grid.GetTileFromPosition(startPoint.x, startPoint.y);
        var targetTile = grid.GetTileFromPosition(targetPoint.x, targetPoint.y);
        if (startTile == null || targetTile == null)
            return;
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
        var closestNode = new AStarNode(null, new point(0,0));

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
                currentNeighbours = NeighboursNESW(currentNode.x, currentNode.y);

                for (var i = 0; i < currentNeighbours.length; i++)
                {
                    nodePath = new AStarNode(currentNode, currentNeighbours[i]);
                    var linearArrayPos = (nodePath.y * grid.xTileCount) + nodePath.x;
                    if (!worldNodes[linearArrayPos])
                    {
                        nodePath.g = currentNode.g + distanceFunction(currentNeighbours[i], currentNode);
                        nodePath.h = distanceFunction(currentNeighbours[i], targetNode);
                        nodePath.f = nodePath.g + nodePath.h;

                        openList.push(nodePath);

                        if (nodePath != null && nodePath.h < closestNode.h) {
                            closestNode = new AStarNode(null, new point(nodePath.x, nodePath.y));
                            closestNode.h = nodePath.h;
                        }

                        worldNodes[linearArrayPos] = true;
                    }
                }
                closedList.push(currentNode);
            }
        }

        if (path.length == 0)
        {
            var closestPath = calculateRawPath(startPoint, grid.GetPositionCenterFromCoord(closestNode.x, closestNode.y));
            for (var l = 0; l < closestPath.length; l++)
                path.push(closestPath[l]);
        }
        
        //push exact point inside target tile
        if(targetTile.walkable == true)
            path.push(targetPoint);
        return path;
    }
}


