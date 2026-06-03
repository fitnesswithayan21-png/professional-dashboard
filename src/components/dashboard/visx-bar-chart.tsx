'use client';

import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { GridRows } from '@visx/grid';
import { ParentSize } from '@visx/responsive';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

export type BarData = {
  name: string;
  lead1: number;
  lead2: number;
};

type TooltipData = {
  bar: { key: string; value: number };
  name: string;
};

interface VisxBarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
}

const keys = ['lead1', 'lead2'];
const colors = ['#3B82F6', '#93C5FD'];

// Accessors
const getName = (d: BarData) => d.name;

const margin = { top: 20, right: 20, bottom: 36, left: 56 };

function BaseVisxBarChart({ data, width, height }: VisxBarChartProps) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipData>();
  
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  // Bounds (fallback to 0 if null)
  const xMax = Math.max((width || 0) - margin.left - margin.right, 0);
  const yMax = Math.max((height || 0) - margin.top - margin.bottom, 0);

  // Scales
  const nameScale = useMemo(
    () => scaleBand<string>({
      domain: data.map(getName),
      padding: 0.3,
      range: [0, xMax],
    }),
    [data, xMax]
  );

  const keyScale = useMemo(
    () => scaleBand<string>({
      domain: keys,
      padding: 0.1,
      range: [0, nameScale.bandwidth() || 1],
    }),
    [nameScale]
  );

  const maxValue = Math.max(...data.map((d) => Math.max(d.lead1, d.lead2)));
  const yDomain = [0, maxValue * 1.1]; // 10% padding on top

  const yScale = useMemo(
    () => scaleLinear<number>({
      domain: yDomain,
      range: [yMax, 0],
    }),
    [yMax, maxValue]
  );

  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: colors,
  });

  if (width == null || height == null || width < 10) return null;

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <svg width={width} height={height}>
        {/* Custom SVG Definitions - You have absolute freedom here! */}
        <defs>
          <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          {/* Example of a custom drop shadow filter you can use */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" />
          </filter>
        </defs>

        <Group left={margin.left} top={margin.top}>
          {/* Grid lines */}
          <GridRows
            scale={yScale}
            width={xMax}
            height={yMax}
            stroke="#F1F5F9"
            strokeDasharray="3 3"
          />

          {/* Bar Groups */}
          <BarGroup
            data={data}
            keys={keys}
            height={yMax}
            x0={getName}
            x0Scale={nameScale}
            x1Scale={keyScale}
            yScale={yScale}
            color={colorScale}
          >
            {(barGroups) =>
              barGroups.map((barGroup) => (
                <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
                  {barGroup.bars.map((bar) => {
                    // Use standard colors, or the custom gradients we defined above
                    const fill = bar.key === 'lead1' ? 'url(#barGradient1)' : 'url(#barGradient2)';
                    
                    return (
                      <rect
                        key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill={fill}
                        rx={4}
                        onMouseMove={(event) => {
                          const eventSvgCoords = localPoint(event);
                          if (!eventSvgCoords) return;
                          showTooltip({
                            tooltipData: { bar, name: data[barGroup.index].name },
                            tooltipTop: eventSvgCoords.y,
                            tooltipLeft: eventSvgCoords.x,
                          });
                        }}
                        onMouseLeave={() => hideTooltip()}
                      />
                    );
                  })}
                </Group>
              ))
            }
          </BarGroup>

          {/* X Axis */}
          <AxisBottom
            top={yMax}
            scale={nameScale}
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={() => ({
              fill: '#94A3B8',
              fontSize: 12,
              fontWeight: 500,
              textAnchor: 'middle',
              dy: 10,
            })}
          />

          {/* Y Axis */}
          <AxisLeft
            scale={yScale}
            stroke="transparent"
            tickStroke="transparent"
            numTicks={5}
            tickFormat={(val) => {
               const value = val.valueOf() as number;
               return `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`;
            }}
            tickLabelProps={() => ({
              fill: '#94A3B8',
              fontSize: 12,
              fontWeight: 500,
              dx: -10,
              dy: 3,
            })}
          />
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: '#ffffff',
            color: '#0F172A',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-[#64748B] font-semibold">{tooltipData.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tooltipData.bar.key === 'lead1' ? '#3B82F6' : '#93C5FD' }} />
              <span>{tooltipData.bar.key === 'lead1' ? 'Website Forms' : 'Referrals'}</span>
              <span className="font-bold ml-2">${tooltipData.bar.value.toLocaleString()}</span>
            </div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export function VisxBarChart({ data }: { data: BarData[] }) {
  return (
    <ParentSize>
      {({ width, height }) => <BaseVisxBarChart data={data} width={width} height={height} />}
    </ParentSize>
  );
}
