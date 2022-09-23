# System Landscaper

This Repository is a fork from [VivaGraphJS](https://github.com/anvaka/VivaGraphJS), yet updated for a more specific purpose: Displaying and allowing the modification of IT-System-Landscapes. More info on this will be provided, if this repo ever goes public.

## Usage

As of now, nothing should work yet and nothing has been tested yet lol.

However, the idea is to provide a single distributed file for the entire library. This library would then set a global variable for scripts to use. The advantage of this is that using this library doesn't require the use of any module bundlers and makes debugging much simpler that way. This is the same approach the original ngraph/VivaGraphJS library used.

## API Specification for highest Abstraction Layer

#### Adding Data

-   addSystem(id/name, data[, parent = null]) -> System

    -   Create a new System/Node, that is added to the System-Landscape

-   linkSystems(from, to, data) -> Edge

    -   Add a new directed edge to the System-Landscape
    -   Should throw a warning/error if a directed link from `from` to `to` already exists in the Landscape

-   linkSystemsUndirected(system1, system2, data) -> Edge

    -   Add a new undirected edge to the System-Landscape
    -   Undirected should be identical to two directed edges from `system1` to `system2` and vice versa. This function should therefore only serve as a shorthand for using linkSystems() twice

#### Getting Data

-   getSystems([startLayer = 0[, endLayer = startLayer[, flatten = false]]]) -> System[] | System[][]

    -   Return a batch of systems that are all on the layer from `startLayer` to `endLayer` inclusive
    -   If `flatten` is set to false, the return value is an Array of Arrays, where each inner Array holds all wanted Systems from a single SystemTree.

-   getSystem(id/name) -> System

    -   Return a single system with the specified id/name or null if it doesn't exist

-   getSystemsByName(name) -> System[]

    -   Get all Systems fitting a specified name

-   getLinksOfSystem(id/node[, horizontal = true[, vertical = false[, includeLinksOfChildren = false]]]) -> Edge[]

    -   Return a list of all edges connected with a certain System
    -   `horizontal` means edges outside of the System-Tree, while `vertical` refers specifially to the nodes in the System-Tree

-   getEdge(id) -> Edge
    -   Return an Edge with the specified ID

#### Removing Data

-   removeSystem(id/name[, removeChildren = true]) -> ?

    -   Removes the system with the specified ID from the System-Landscape
    -   `removeChildren` indicates whether any children should be removed as well or moved up to the removed system's parent
    -   If the System is the root of a System Tree and `removeChildren` is false, then each child-system creates its own new System-Tree

-   removeEdge(id/name) -> ?

    -   Removes an Edge from the System-Landscape specified by its id/name

#### Updating Data

-   updateSystem(id/name, data) -> System

    -   Updates the data associated with a node specified by its id/name

-   updateEdge(id/name, data) -> Edge

    -   Updates the data associated with an edge specified by its id/name

#### Moving Data

-   moveSystem(id/name, newParent[, moveChildren = true])

    -   Moves a System specified by its id/name to be the child of `newParent`
    -   If `newParent` references a System-Tree, the node becomes that Tree's new root, taking the old root as a new child
    -   If `newParent` is null, then the node becomes the root of its own system-tree
    -   `moveChildren` indicates whether the node's children should be moved with the system.

-   moveEdge(id/name, newSource, newTarget[, keepBidirectional = true])
    -   Move an Edge to a source/target. Usually only one of the parameters needs to be changed at once. Setting either of the parameters at null, will keep it connected with the old system
    -   `keepBidirectional` indicates whether to move both edges if there are two directed edges connecting the systems in both directions. This is a shorthand to calling moveEdge() twice

#### Positioning

-   positionSystem(id/name, x, y) -> Plane

-   positionSystemTree(id/name, x, y) -> Plane

-   automaticLayout(layout) -> Plane

    -   Run some automatic layout algorithm on the System-Landscape and return the newly created Plane

-   positionEdge(???) -> Plane

    -   Change the positioning/curving of edges
    -   Maybe by specifying parameters for Bezier curves?
    -   Maybe by adding points and creating 90° angles?

#### Saving / Loading

-   save([format[, location = null]])

    -   Saves relevant data of the System-Graph as well as its layout
    -   Saves as a file in the specified location and in the specified file-format (if supported)
    -   Since this is meant to run as some website, location can be null, indicating to save it on the server instead of on the client's computer

-   load(file/filepath[, format])

    -   Load all data from a file

-   saveView(name)

    -   Save the current view under a specified, unique name

-   deleteView(name)

    -   Delete a saved view again

-   goBack([steps = 1]) -> System-Landscape

    -   Go Backwards some specified number of steps. Every action should be saved to allow for easy editing by pressing `Crtl+Z` and reversing any unwanted changed
    -   Changes should correspond to both changes in the Graph-Data and its positioning

-   goForward([steps = 1]) -> System-Landscape

    -   The opposite of goBack()
    -   Only possible if no changes happened after goBack() was called

### TO Remember when Implementing

-   Useful Error Messages should be built in from the beginning
-   Event System for every change should be built in

## Specifications for UI

(To be added)

## Local Build

Run the following script:

```
git clone https://github.com/artinlines/system-landscaper
cd ./system-landscaper
npm install
npm run build
```

The combined/minified code should be stored in `dist` folder.

To run the website, open the `ui/index.html` file in your browser. The html file loads the minified code from the `dist` folder.
