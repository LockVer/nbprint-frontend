/*
 * @Author: xx 
 * @Date: 2024-07-24 10:56:05 
 * @Last Modified by: xx
 * @Last Modified time: 2024-07-24 11:16:46
 * @description: 用于调整区域大小的工具函数
 * 
 * 1. resizeArea: 调整区域大小
 * 2. resizeFromTop: 从顶部调整区域大小
 * 3. resizeFromBottom: 从底部调整区域大小
 * 4. resizeFromLeft: 从左侧调整区域大小
 * 5. resizeFromRight: 从右侧调整区域大小
 * 6. updateCursor: 更新鼠标样式
 * 7. determineResizeDirection: 确定调整方向
 */

/*
    * 调整区域大小
    * @param {number} x - 鼠标x坐标
    * @param {number} y - 鼠标y坐标
    * @param {object} resizeDirection - 调整方向
    * @param {object} activeArea - 当前活动区域
    * @param {object} revealAreas - 所有区域
    * @param {object} alignLine - 对齐线
    * @param {object} canvasRef - 画布引用
    * @returns {void}
*/
const resizeArea = (x, y, resizeDirection, activeArea, revealAreas, alignLine, canvasRef) => {
    switch (resizeDirection.value) {
      case 'top-left':
        resizeFromTop(y, activeArea, revealAreas, alignLine, canvasRef);
        resizeFromLeft(x, activeArea, revealAreas, alignLine, canvasRef);
        break;
      case 'top-right':
        resizeFromTop(y, activeArea, revealAreas, alignLine, canvasRef);
        resizeFromRight(x, activeArea, revealAreas, alignLine, canvasRef);
        break;
      case 'bottom-left':
        resizeFromBottom(y, activeArea, revealAreas, alignLine, canvasRef);
        resizeFromLeft(x, activeArea, revealAreas, alignLine, canvasRef);
        break;
      case 'bottom-right':
        resizeFromBottom(y, activeArea, revealAreas, alignLine, canvasRef);
        resizeFromRight(x, activeArea, revealAreas, alignLine, canvasRef);
        break;
      case 'left':
        resizeFromLeft(x, activeArea, revealAreas, alignLine, canvasRef);
        break;
      case 'right':
        resizeFromRight(x, activeArea, revealAreas, alignLine, canvasRef);
        break;
      case 'top':
        resizeFromTop(y, activeArea, revealAreas, alignLine, canvasRef);
        break;
      case 'bottom':
        resizeFromBottom(y, activeArea, revealAreas, alignLine, canvasRef);
        break;
      // 默认情况下不需要执行任何操作
    }
  };
/*
    * 从顶部调整区域大小
    * @param {number} y - 鼠标y坐标
    * @param {object} activeArea - 当前活动区域
    * @param {object} revealAreas - 所有区域
    * @param {object} alignLine - 对齐线
    * @param {object} canvasRef - 画布引用
    * @returns {void}
*/
const resizeFromTop = (y, activeArea, revealAreas, alignLine, canvasRef) => {
    const originalHeight = activeArea.value.height;
    activeArea.value.height += activeArea.value.y - y;
    activeArea.value.y = y;
    if (activeArea.value.height < 10) {
        activeArea.value.y -= 10 - originalHeight;
        activeArea.value.height = 10;
    }
    //改变高度时，需要检查顶边是否和其他区域的顶边对齐，如果是，则显示对齐线
    alignLine.value = [];
    revealAreas.value.forEach(area => {
        if (area !== activeArea.value && Math.abs(activeArea.value.y - area.y) == 0) {
            activeArea.value.y = area.y;
            alignLine.value.push({ x: 0, y: area.y, width: canvasRef.value.width, height: 1 });
        }
    });
};
/*
    * 从底部调整区域大小
    * @param {number} y - 鼠标y坐标
    * @param {object} activeArea - 当前活动区域
    * @param {object} revealAreas - 所有区域
    * @param {object} alignLine - 对齐线
    * @param {object} canvasRef - 画布引用
    * @returns {void}

*/
const resizeFromBottom = (y, activeArea, revealAreas, alignLine, canvasRef) => {
    const newY = Math.max(y, activeArea.value.y + 10);
    activeArea.value.height = newY - activeArea.value.y;
    //改变高度时，需要检查底边是否和其他区域的底边对齐，如果是，则显示对齐线
    alignLine.value = [];
    revealAreas.value.forEach(area => {
        if (area !== activeArea.value && Math.abs(activeArea.value.y + activeArea.value.height - area.y - area.height) == 0) {
            alignLine.value.push({ x: 0, y: area.y + area.height, width: canvasRef.value.width, height: 1 });
        }
    });
};
/*
    * 从左侧调整区域大小
    * @param {number} x - 鼠标x坐标
    * @param {object} activeArea - 当前活动区域
    * @param {object} revealAreas - 所有区域
    * @param {object} alignLine - 对齐线
    * @param {object} canvasRef - 画布引用
    * @returns {void}

*/
const resizeFromLeft = (x, activeArea, revealAreas, alignLine, canvasRef) => {
    const originalWidth = activeArea.value.width;
    activeArea.value.width += activeArea.value.x - x;
    activeArea.value.x = x;
    if (activeArea.value.width < 10) {
        activeArea.value.x -= 10 - originalWidth;
        activeArea.value.width = 10;
    }
    //改变宽度时，需要检查左边是否和其他区域的左边对齐，如果是，则显示对齐线
    alignLine.value = [];
    revealAreas.value.forEach(area => {
        if (area !== activeArea.value && Math.abs(activeArea.value.x - area.x) == 0) {
            alignLine.value.push({ x: area.x, y: 0, width: 1, height: canvasRef.value.height });
        }
    });
};
/*
    * 从右侧调整区域大小
    * @param {number} x - 鼠标x坐标
    * @param {object} activeArea - 当前活动区域
    * @param {object} revealAreas - 所有区域
    * @param {object} alignLine - 对齐线
    * @param {object} canvasRef - 画布引用
    * @returns {void}
*/
const resizeFromRight = (x, activeArea, revealAreas, alignLine, canvasRef) => {
    const newX = Math.max(x, activeArea.value.x + 10);
    activeArea.value.width = newX - activeArea.value.x;
    //改变宽度时，需要检查右边是否和其他区域的右边对齐，如果是，则显示对齐线
    alignLine.value = [];
    revealAreas.value.forEach(area => {
        if (area !== activeArea.value && Math.abs(activeArea.value.x + activeArea.value.width - area.x - area.width) == 0) {
            alignLine.value.push({ x: area.x + area.width, y: 0, width: 1, height: canvasRef.value.height });
        }
    });
};
/*
    * 更新鼠标样式
    * @param {number} x - 鼠标x坐标
    * @param {number} y - 鼠标y坐标
    * @param {object} revealAreas - 所有区域
    * @param {object} canvasRef - 画布引用
    * @returns {void}

*/
const updateCursor = (x, y, revealAreas, canvasRef) => {
    let cursor = 'default';
    revealAreas.value.forEach(area => {
        if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
            const nearLeft = Math.abs(x - area.x) < 10;
            const nearRight = Math.abs(x - (area.x + area.width)) < 10;
            const nearTop = Math.abs(y - area.y) < 10;
            const nearBottom = Math.abs(y - (area.y + area.height)) < 10;

            if (nearTop && nearLeft) {
                cursor = 'nw-resize'; // Top left corner
            } else if (nearTop && nearRight) {
                cursor = 'ne-resize'; // Top right corner
            } else if (nearBottom && nearLeft) {
                cursor = 'sw-resize'; // Bottom left corner
            } else if (nearBottom && nearRight) {
                cursor = 'se-resize'; // Bottom right corner
            } else if (nearTop) {
                cursor = 'n-resize'; // Top edge
            } else if (nearBottom) {
                cursor = 's-resize'; // Bottom edge
            } else if (nearLeft) {
                cursor = 'w-resize'; // Left edge
            } else if (nearRight) {
                cursor = 'e-resize'; // Right edge
            } else {
                cursor = 'move'; // Inside the area but not near the edges
            }
        }
    });
    canvasRef.value.style.cursor = cursor;
};
/*
    * 确定调整方向
    * @param {number} x - 鼠标x坐标
    * @param {number} y - 鼠标y坐标
    * @param {object} area - 区域
    * @returns {string} - 调整方向
*/
const determineResizeDirection = (x, y, area) => {
    const nearLeft = Math.abs(x - area.x) < 10;
    const nearRight = Math.abs(x - (area.x + area.width)) < 10;
    const nearTop = Math.abs(y - area.y) < 10;
    const nearBottom = Math.abs(y - (area.y + area.height)) < 10;

    if (nearLeft && nearTop) return 'top-left';
    if (nearRight && nearTop) return 'top-right';
    if (nearLeft && nearBottom) return 'bottom-left';
    if (nearRight && nearBottom) return 'bottom-right';
    if (nearLeft) return 'left';
    if (nearRight) return 'right';
    if (nearTop) return 'top';
    if (nearBottom) return 'bottom';
    return '';
};

export { resizeArea, updateCursor,determineResizeDirection };