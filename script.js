document.addEventListener("DOMContentLoaded", () => {
  const folders = document.querySelectorAll("#grid > div");
  const windows = document.querySelectorAll(".folder-window");
  const closeButtons = document.querySelectorAll(".close-btn");

  const isMobile = () => window.innerWidth <= 600;
  const getPrefix = () => (isMobile() ? "Mobile" : "Desktop");

  // Restore saved state
  windows.forEach(win => {
  const id = win.id;
  const prefix = getPrefix();
  console.log(`Screen mode: ${getPrefix()}`);

  if (isMobile()) {
    // Apply mobile styles only if not already applied
    if (!win.classList.contains("mobile-locked")) {
      console.log(`Applying mobile layout to window: ${id}`);
      win.style.position = "fixed";
      win.style.top = "0";
      win.style.left = "0";
      win.style.width = "100vw";
      win.style.height = "100vh";
      win.style.transform = "none";
      win.classList.add("mobile-locked");
    } else {
      console.log(`Mobile layout already applied to window: ${id}`);
    }
  } else {
    // Clear mobile styles
    if (win.classList.contains("mobile-locked")) {
      console.log(`Removing mobile layout from window: ${id}`);
      win.classList.remove("mobile-locked");
      win.style.position = "";
      win.style.top = "";
      win.style.left = "";
      win.style.width = "";
      win.style.height = "";
      win.style.transform = "";
    }

    // Restore saved position
    const savedPos = localStorage.getItem(`windowPos_Desktop_${id}`);
    if (savedPos) {
      const { left, top } = JSON.parse(savedPos);
      console.log(`Restoring position for window ${id}: left=${left}, top=${top}`);
      win.style.left = left + "px";
      win.style.top = top + "px";
      win.style.transform = "none";
    } else {
      console.log(`No saved position for window: ${id}`);
    }

    // Restore saved size
    const savedSize = localStorage.getItem(`windowSize_Desktop_${id}`);
    if (savedSize) {
      const { width, height } = JSON.parse(savedSize);
      console.log(`Restoring size for window ${id}: width=${width}, height=${height}`);
      win.style.width = width + "px";
      win.style.height = height + "px";
    } else {
      console.log(`No saved size for window: ${id}`);
    }

    // Restore visibility
    const savedOpen = localStorage.getItem(`windowOpen_${id}`);
    console.log(`Restoring visibility for window ${id}: show=${savedOpen === "true"}`);
    win.classList.toggle("show", savedOpen === "true");
  }
});


  // Folder click opens window
  folders.forEach(folder => {
    folder.addEventListener("click", () => {
      const windowId = folder.getAttribute("data-window-id");
      const win = document.getElementById(windowId);
      if (win) {
        win.classList.add("show");
        localStorage.setItem(`windowOpen_${win.id}`, "true");
      }

      if (isMobile()) {
        document.getElementById("grid").classList.remove("show");
      }
    });
  });

  // Close button
  closeButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      const win = e.target.closest(".folder-window");
      if (win) {
        win.classList.remove("show");
        localStorage.setItem(`windowOpen_${win.id}`, "false");
      }
    });
  });

  // Dragging
  windows.forEach(win => {
    if (win.classList.contains("mobile-locked")) return;

    const header = win.querySelector(".window-header");
    if (!header) return;

    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener("mousedown", e => {
      isDragging = true;
      const rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = "auto";

        const prefix = getPrefix();
        const left = win.offsetLeft;
        const top = win.offsetTop;
        localStorage.setItem(`windowPos_${prefix}_${win.id}`, JSON.stringify({ left, top }));
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

  // Resizing
  windows.forEach(win => {
    if (win.classList.contains("mobile-locked")) return;

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
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = "auto";

        const prefix = getPrefix();
        const width = win.offsetWidth;
        const height = win.offsetHeight;
        localStorage.setItem(`windowSize_${prefix}_${win.id}`, JSON.stringify({ width, height }));
      }
    });

    document.addEventListener("mousemove", e => {
      if (!isResizing) return;

      let newWidth = startWidth + (e.clientX - startX);
      let newHeight = startHeight + (e.clientY - startY);
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
