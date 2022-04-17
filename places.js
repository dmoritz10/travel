function btnPlacesHtml() {




    var treeData = [
        {
          text: "Node 1",
          icon: "fa fa-folder", // requires font awesome
          nodes: [
            {
              text: "Sub Node 1",
              icon: "fa fa-folder",
              nodes: [
                {
                  id:    "sub-node-1",
                  text:  "Sub Child Node 1",
                  icon:  "fa fa-folder",
                  class: "nav-level-3",
                  href:  " "
                },
                {
                  text: "Sub Child Node 2",
                  icon: "fa fa-folder"
                }
              ]
            },
            {
              text: "Sub Node 2",
               icon: "fa fa-folder"
            }
          ]
        },
        {
          text: "Node 2",
          icon: "fa fa-folder"
        },
        {
          text: "Node 3",
          icon: "fa fa-folder"
        },
        {
          text: "Node 4",
          icon: "fa fa-folder"
        },
        {
          text: "Node 5",
          icon: "fa fa-folder"
        }
    ];



    $('#plContainer').bstreeview({ 
        data: treeData
      });

}