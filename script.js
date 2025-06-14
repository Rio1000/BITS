document.addEventListener("DOMContentLoaded", () => {
  const folders = document.querySelectorAll("#grid > div");
  const windows = document.querySelectorAll(".folder-window");
  const closeButtons = document.querySelectorAll(".close-btn");

  // Restore saved position, size and visibility
  windows.forEach(win => {
    const id = win.id;

    // Position
    const savedPos = localStorage.getItem(`windowPos_${id}`);
    if (savedPos) {
      const { left, top } = JSON.parse(savedPos);
      win.style.left = left + "px";
      win.style.top = top + "px";
      win.style.transform = "none";
    }

    // Size
    const savedSize = localStorage.getItem(`windowSize_${id}`);
    if (savedSize) {
      const { width, height } = JSON.parse(savedSize);
      if(width && height) {
        win.style.width = width + "px";
        win.style.height = height + "px";
      }
    }

    // Visibility
    const savedOpen = localStorage.getItem(`windowOpen_${id}`);
    if (savedOpen === "true") {
      win.classList.add("show");
    } else {
      win.classList.remove("show");
    }
  });

  folders.forEach(folder => {
    folder.addEventListener("click", () => {
      const windowId = folder.getAttribute("data-window-id");
      const windowToShow = document.getElementById(windowId);
      if (windowToShow) {
        windowToShow.classList.add("show");
        localStorage.setItem(`windowOpen_${windowId}`, "true");
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      const win = e.target.closest(".folder-window");
      if (win) {
        win.classList.remove("show");
        localStorage.setItem(`windowOpen_${win.id}`, "false");
      }
    });
  });

  // Dragging functionality
  windows.forEach(win => {
    const header = win.querySelector(".window-header");
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener("mousedown", e => {
      isDragging = true;
      const rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener("mouseup", e => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = 'auto';

        const left = win.offsetLeft;
        const top = win.offsetTop;
        localStorage.setItem(`windowPos_${win.id}`, JSON.stringify({ left, top }));
      }
    });

    document.addEventListener("mousemove", e => {
      if (!isDragging) return;
      let left = e.clientX - offsetX;
      let top = e.clientY - offsetY;

      const winWidth = win.offsetWidth;
      const winHeight = win.offsetHeight;
      const maxLeft = window.innerWidth - winWidth;
      const maxTop = window.innerHeight - winHeight;

      left = Math.min(Math.max(0, left), maxLeft);
      top = Math.min(Math.max(0, top), maxTop);

      win.style.left = left + "px";
      win.style.top = top + "px";
      win.style.transform = "none";
    });
  });

  // Resizing functionality
  windows.forEach(win => {
    const resizeHandle = win.querySelector(".resize-handle");
    if (!resizeHandle) return;

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener("mousedown", e => {
      e.preventDefault();
      isResizing = true;
      const rect = win.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = rect.width;
      startHeight = rect.height;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener("mouseup", e => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = 'auto';

        // Save size to localStorage
        const width = win.offsetWidth;
        const height = win.offsetHeight;
        localStorage.setItem(`windowSize_${win.id}`, JSON.stringify({ width, height }));
      }
    });

    document.addEventListener("mousemove", e => {
      if (!isResizing) return;

      let newWidth = startWidth + (e.clientX - startX);
      let newHeight = startHeight + (e.clientY - startY);

      // Optional: set min/max sizes
      const minWidth = 200;
      const minHeight = 150;
      const maxWidth = window.innerWidth - win.offsetLeft;
      const maxHeight = window.innerHeight - win.offsetTop;

      newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      newHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);

      win.style.width = newWidth + "px";
      win.style.height = newHeight + "px";
    });
  });
});
document.getElementById("navToggle").addEventListener("click", () => {
  document.getElementById("grid").classList.toggle("show");
});
document.querySelectorAll("#grid > div").forEach(btn => {
  btn.addEventListener("click", () => {
    if (window.innerWidth <= 600) {
      document.getElementById("grid").classList.remove("show");
    }
  });
});
