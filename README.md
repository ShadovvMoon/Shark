# Shark
An interactive tool to help mark assignments for a course I tutor at the University of Queensland.

## Setup
    npm install
    node index.js

## Criteria
The criteria file is stored in ```./src/resources/criteria.json```. The file contains a JSON array of nodes that are described below. Check boxes are only shown on nodes without children. 

#### Node Attributes
|Attribute|Description|
|--------|------------|
|id|A unique identifier for the node|
|criteria|A description of the criteria| 
|weight|How much the node is worth|
|children|An array containing children nodes|
|requires|An array containing required node identifiers|
|true|Default text displayed when the node is ticked|
|false|Default text displayed when the node is unticked|

Here is an example criteria file:
```json
[
    {
        "criteria": "Graphical User Interface",
        "weight": 10,
        "children": [
            {
                "criteria": "Layout",
                "weight": 10,
                "children": [
                    {
                        "criteria": "Gui layout is correct",
                        "weight": 5,
                        "false": "The GUI layout does not match the provided screenshots"
                    },
                    {
                        "criteria": "Canvas resizes",
                        "weight": 2.5,
                        "false": "The canvas does not resize correctly"
                    },
                    {
                        "criteria": "Controls resize",
                        "weight": 2.5,
                        "false": "The controls do not resize correctly"
                    }
                ]
            }
        ]
    }
]
```