
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import EnhancedBadgeImage from './EnhancedBadgeImage';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  rarity: string;
}

interface VirtualizedBadgeGridProps {
  badges: BadgeItem[];
  onBadgeClick: (badge: BadgeItem) => void;
  hasNextPage: boolean;
  loadNextPage: () => Promise<void>;
  isLoading: boolean;
  containerWidth: number;
  containerHeight: number;
}

const ITEM_SIZE = 40;
const GAP = 2;

const BadgeGridItem = React.memo(({ 
  columnIndex, 
  rowIndex, 
  style, 
  data 
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    badges: BadgeItem[];
    columnsCount: number;
    onBadgeClick: (badge: BadgeItem) => void;
  };
}) => {
  const { badges, columnsCount, onBadgeClick } = data;
  const index = rowIndex * columnsCount + columnIndex;
  const badge = badges[index];

  if (!badge) {
    return (
      <div style={style}>
        <div className="w-full h-full bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div style={style} className="p-0.5">
      <button
        onClick={() => onBadgeClick(badge)}
        className="group relative w-full h-full hover:bg-gray-100 rounded transition-colors duration-200 p-0.5"
        title={`${badge.code} - ${badge.name}`}
      >
        <EnhancedBadgeImage
          code={badge.code}
          name={badge.name}
          size="sm"
          showFallback={true}
          className="w-full h-full"
        />
        
        {/* Indicador de raridade */}
        {badge.rarity !== 'common' && (
          <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full shadow-sm ${
            badge.rarity === 'legendary' ? 'bg-yellow-500' :
            badge.rarity === 'rare' ? 'bg-purple-500' : 'bg-blue-500'
          }`} />
        )}
      </button>
    </div>
  );
});

BadgeGridItem.displayName = 'BadgeGridItem';

export const VirtualizedBadgeGrid: React.FC<VirtualizedBadgeGridProps> = ({
  badges,
  onBadgeClick,
  hasNextPage,
  loadNextPage,
  isLoading,
  containerWidth,
  containerHeight
}) => {
  const columnsCount = Math.floor((containerWidth - 8) / (ITEM_SIZE + GAP));
  const rowsCount = Math.ceil(badges.length / columnsCount);
  
  const itemData = useMemo(() => ({
    badges,
    columnsCount,
    onBadgeClick
  }), [badges, columnsCount, onBadgeClick]);

  const isItemLoaded = useCallback((index: number) => {
    return index < badges.length;
  }, [badges.length]);

  const loadMoreItems = useCallback(async () => {
    if (!isLoading && hasNextPage) {
      await loadNextPage();
    }
  }, [isLoading, hasNextPage, loadNextPage]);

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={hasNextPage ? badges.length + 50 : badges.length}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <Grid
          ref={ref}
          height={containerHeight}
          width={containerWidth}
          columnCount={columnsCount}
          columnWidth={ITEM_SIZE + GAP}
          rowCount={rowsCount + (hasNextPage ? 5 : 0)}
          rowHeight={ITEM_SIZE + GAP}
          itemData={itemData}
          onItemsRendered={({
            visibleRowStartIndex,
            visibleRowStopIndex,
            visibleColumnStartIndex,
            visibleColumnStopIndex
          }) => {
            onItemsRendered({
              visibleStartIndex: visibleRowStartIndex * columnsCount + visibleColumnStartIndex,
              visibleStopIndex: visibleRowStopIndex * columnsCount + visibleColumnStopIndex
            });
          }}
          className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {BadgeGridItem}
        </Grid>
      )}
    </InfiniteLoader>
  );
};
