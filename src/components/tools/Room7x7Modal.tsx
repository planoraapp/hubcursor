import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const BLOCK_SIZE = 55
const HORIZONTAL_ROWS = 6
const VERTICAL_ROWS = 8
const DOOR_TILE = 4

export const Room7x7Modal: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [avatarPosition, setAvatarPosition] = useState({ x: (HORIZONTAL_ROWS / 2) * BLOCK_SIZE + BLOCK_SIZE / 2, y: (VERTICAL_ROWS / 2) * BLOCK_SIZE + BLOCK_SIZE / 2 })
  const [avatarDirection, setAvatarDirection] = useState(2) // 0-7 direções
  const [isMoving, setIsMoving] = useState(false)

  // Função para mover avatar para um tile específico
  const moveAvatarToTile = (tileIndex: number) => {
    if (isMoving) return
    
    const col = tileIndex % HORIZONTAL_ROWS
    const row = Math.floor(tileIndex / HORIZONTAL_ROWS)
    
    // Calcular posição central do tile, limitando aos limites da sala
    // Deslocar um quarto de tile para a esquerda quando estiver na última linha
    const adjustedCol = row === VERTICAL_ROWS - 1 ? Math.max(0, col - 0.25) : col
    const x = Math.min(adjustedCol * BLOCK_SIZE + BLOCK_SIZE / 2, (HORIZONTAL_ROWS - 1) * BLOCK_SIZE + BLOCK_SIZE / 2)
    const y = Math.min(row * BLOCK_SIZE + BLOCK_SIZE / 2, (VERTICAL_ROWS - 1) * BLOCK_SIZE + BLOCK_SIZE / 2)
    
    // Calcular direção baseada na posição relativa
    const currentCol = Math.floor(avatarPosition.x / BLOCK_SIZE)
    const currentRow = Math.floor(avatarPosition.y / BLOCK_SIZE)
    
    const deltaX = col - currentCol
    const deltaY = row - currentRow
    
    // Mapear delta para direção (0-7)
    let direction = 2 // padrão
    if (deltaX > 0 && deltaY === 0) direction = 2 // direita
    else if (deltaX < 0 && deltaY === 0) direction = 6 // esquerda
    else if (deltaX === 0 && deltaY > 0) direction = 4 // baixo
    else if (deltaX === 0 && deltaY < 0) direction = 0 // cima
    else if (deltaX > 0 && deltaY > 0) direction = 3 // diagonal direita-baixo
    else if (deltaX < 0 && deltaY > 0) direction = 5 // diagonal esquerda-baixo
    else if (deltaX > 0 && deltaY < 0) direction = 1 // diagonal direita-cima
    else if (deltaX < 0 && deltaY < 0) direction = 7 // diagonal esquerda-cima
    
    setAvatarDirection(direction)
    setAvatarPosition({ x, y })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="habbo-button-blue sidebar-font-option-4"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            letterSpacing: '0.2px'
          }}>Abrir Quarto 6x8</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="volter-font">Sala Isométrica 6x8 (Habbo Style)</DialogTitle>
          <DialogDescription className="volter-font">Clique em um piso para mover o avatar</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center items-center" style={{ height: 520, background: 'black', padding: '40px' }}>
          <style>{`
            .room {
              --door-tile: ${DOOR_TILE};
              --wall-width: 15px;
              --wall-height: 175px;
              --block-size: ${BLOCK_SIZE}px;
              --room-horizontal-rows: ${HORIZONTAL_ROWS};
              --room-vertical-rows: ${VERTICAL_ROWS};
              
              position: relative;
            }

            .door {
              position: relative;
              background: black;
              overflow: hidden;
              cursor: pointer;
            }

            .room .y-wall .door {
              top: calc(var(--door-tile) * var(--block-size));
              height: var(--block-size);
              width: 75%;
            }

            .room .y-wall .door:before {
              top: 25px;
              left: 78px;
              width: var(--block-size); height: var(--block-size);
              transform: skewY(-45deg);
            }

            .room .x-wall .door:before {
              bottom: 0;
              left: 28px;
              width: var(--block-size); height: var(--block-size);
              transform: skewX(-45deg);
            }

            .room .x-wall .door {
              left: calc(var(--tile) * var(--block-size));
              height: 75%;
              width: var(--block-size);
            }

            .door:hover:before {
              outline: 3px dashed white;
              outline-offset: -3px;
            }

            .door:before {
              content: '';
              position: absolute;
              background: #8F8B5D;
              outline: 1px solid #858255;
              outline-offset: -1px;
            }

            .room .y-wall {
              display: flex;
              justify-content: flex-end;
              
              position: absolute;
              right: 100%;
              
              height: 100%;
              width: var(--wall-height);
              background: #878892;
              
              transform: skewY(45deg) translateY(calc(var(--wall-height) / 2 * -1));
              z-index: 1;
            }

            .room .y-wall:before {
              content: "";
              position: absolute;
              height: var(--wall-width);
              width: calc(100% + var(--wall-width));
              background: #ACB1C1;
              top: 100%;
              right: calc(var(--wall-width) / 2 * -1);
              transform: skewX(-45deg);
            }

            .room .y-wall:after {
              content: "";
              position: absolute;
              height: calc(100% + var(--wall-width));
              width: var(--wall-width);
              background: #66676F;
              right: 100%;
              bottom: calc(var(--wall-width) / 2 * -1);
              transform: skewY(-45deg);
            }

            .room .x-wall {
              display: flex;
              align-items: flex-end;
              
              position: absolute;
              height: var(--wall-height);
              bottom: 100%;
              width: 100%;
              background: #ACB1C1;
              transform: skewX(45deg) translateX(calc(var(--wall-height) / 2 * -1));
              z-index: 1;
            }

            .room .x-wall:before {
              content: "";
              position: absolute;
              height: calc(100% + var(--wall-width));
              width: var(--wall-width);
              background: #878892;
              left: 100%;
              top: calc(var(--wall-width) / 2 * -1);
              transform: skewY(-45deg);
            }

            .room .x-wall:after {
              content: "";
              position: absolute;
              height: var(--wall-width);
              width: calc(100% + var(--wall-width));
              background: #66676F;
              bottom: 100%;
              left: calc(var(--wall-width) / 2 * -1);
              transform: skewX(-45deg);
            }

            .room .floor {
                display: grid;
                width: calc(var(--block-size) * var(--room-horizontal-rows));
                height: calc(var(--block-size) * var(--room-vertical-rows));

                grid-template-columns: repeat(auto-fill, var(--block-size));
                grid-template-rows: repeat(auto-fill, var(--block-size));
                z-index: 10;
                position: relative;
            }

            .isometric {
                transform: translateZ(3em) rotateX(60deg) rotateZ(45deg);
                transform-style: preserve-3d;
            }

            .block {
                --side-size: 15px;

                position: relative;
                background: #8F8B5D;
                outline: 1px solid #858255;
                outline-offset: -1px;
                cursor: pointer;
                will-change: box-shadow;
            }

            .block:hover {
                box-shadow: inset 0 0 0 3px white;
                outline: 1px solid #858255;
            }

            .block:after {
                content: "";
                position: absolute;
                top: 100%;
                width: 100%; height: var(--side-size);
                background: #6D6C47;
                transform: skewX(45deg) translateX(calc(var(--side-size) / 2));
                pointer-events: none;
            }

            .block:before {
                content: "";
                position: absolute;
                left: 100%;
                width: var(--side-size); height: 100%;
                background: #6D6C47;
                transform: skewY(45deg) translateY(calc(var(--side-size) / 2));
                pointer-events: none;
            }

            .avatar {
              position: absolute;
              transform: translate(-50%, -100%);
              width: 44px; 
              height: 220px;
              z-index: 1000;
            }

            .avatar img {
              position: absolute;
              transform: translate(-50%, -50%) rotate(-45deg);
              top: 50%; 
              left: 50%;
              width: 44px;
              height: 220px;
              imageRendering: pixelated;
            }
          `}</style>
          <div 
            id="room-container"
            className="room isometric"
          >
            {/* X Wall (top) */}
            <div className="x-wall">
            </div>
            
            {/* Y Wall (left) */}
            <div className="y-wall">
              <div className="door"></div>
            </div>
            
            {/* Floor */}
            <div className="floor">
              {Array.from({ length: HORIZONTAL_ROWS * VERTICAL_ROWS }, (_, i) => (
                <div
                  key={i}
                  className="block"
                  onClick={() => moveAvatarToTile(i)}
                />
              ))}
            </div>
            
            {/* Avatar */}
            <div 
              className="avatar"
              style={{
                left: `${avatarPosition.x}px`,
                top: `${avatarPosition.y}px`,
              }}
            >
              <img
                src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1.ch-210-66.lg-270-66.hr-100-61&size=l&direction=${avatarDirection}&head_direction=${avatarDirection}&gesture=std`}
                alt="habbo"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Room7x7Modal


