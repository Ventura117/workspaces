document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    loadSidebarOptions();
});

function buildHeader() {
    const header = document.getElementById("main-header");

    header.innerHTML = `
        <div id="header-left">
            <span id="site-title">Workspaces</span>
            <span id="page-title"></span>
        </div>
        <div id="header-right">
            <input id="searchbar" placeholder="Search..." />
            <span id="current-user">User01</span>
        </div>
    `;
}

async function loadSidebarOptions() {
    try {
        const response = await fetch("/api/sidebar_options");
        const data = await response.json();

        const sidebar = document.getElementById("sidebar");

        const currentPath = window.location.pathname;

        const currentOption = data.find(opt => opt.url === currentPath);
          if (currentOption) {
            const pageTitleEl = document.getElementById("page-title");
            if (pageTitleEl) pageTitleEl.textContent = currentOption.label;
        }

        const parents = data
            .filter(opt => opt.parent_id === null)
            .sort((a, b) => a.order_index - b.order_index);

        parents.forEach(parent => {
            const children = data
                .filter(opt => opt.parent_id === parent.id)
                .sort((a, b) => a.order_index - b.order_index);

            // --- Create parent container ---
            const parentDiv = document.createElement("div");
            parentDiv.className = "sidebar-item sidebar-parent";
            parentDiv.dataset.id = parent.id;

            // Parent has children → NO url
            // Parent has no children → should navigate
            if (children.length === 0 && parent.url) {
                parentDiv.innerHTML = `<a href="${parent.url}" class="sidebar-link"><span>${parent.label}</span></a>`;
                // Highlight active container
                if (parent.url === currentPath) {
                    parentDiv.classList.add("active");
                }
            } else {
                parentDiv.innerHTML = `<span>${parent.label}</span>`;
            }

            // Append parent FIRST
            sidebar.appendChild(parentDiv);

            let arrow = null;
            let childContainer = null;

            // --- Handle parents that have children ---
            if (children.length > 0) {
                // Add arrow for collapsible parent
                arrow = document.createElement("span");
                arrow.className = "arrow";
                arrow.textContent = ">";
                parentDiv.appendChild(arrow);

                // Create child container
                childContainer = document.createElement("div");
                childContainer.className = "child-container";

                // Append AFTER parent
                sidebar.appendChild(childContainer);

                // Create child items
                children.forEach(child => {
                    const childDiv = document.createElement("div");
                    childDiv.className = "sidebar-item";
                    childDiv.dataset.id = child.id;

                    childDiv.innerHTML = `<a href="${child.url}" class="sidebar-link">${child.label}</a>`;

                    // Highlight active container
                    if (child.url === currentPath) {
                        childDiv.classList.add("active");
                        // Expand parent container if child is active
                        childContainer.style.display = "block";
                        if (arrow) arrow.classList.add("open");
                    }

                    childContainer.appendChild(childDiv);
                });

                // Collapse toggle
                parentDiv.addEventListener("click", () => {
                    const isOpen = childContainer.style.display === "block";
                    childContainer.style.display = isOpen ? "none" : "block";
                    arrow.classList.toggle("open", !isOpen);
                });
            }
        });

    } catch (err) {
        console.error("Error loading sidebar options", err);
    }
}