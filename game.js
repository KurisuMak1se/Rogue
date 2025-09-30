function Game() {
    this.mapWidth = 40;
    this.mapHeight = 24;
    this.tileSize = 25;
    this.map = [];
    this.hero = null;
    this.enemies = [];
    this.items = [];
    this.turn = 0;
}

Game.prototype.init = function() {
    this.generateMap();
    this.render();
    this.updateStats();
};

Game.prototype.generateMap = function() {
    // Инициализация карты стенами
    for (var y = 0; y < this.mapHeight; y++) {
        this.map[y] = [];
        for (var x = 0; x < this.mapWidth; x++) {
            this.map[y][x] = 'W'; // Стена
        }
    }
    
    // Создание комнат
    var roomCount = this.getRandomInt(5, 10);
    var rooms = [];
    
    for (var i = 0; i < roomCount; i++) {
        var roomWidth = this.getRandomInt(3, 8);
        var roomHeight = this.getRandomInt(3, 8);
        var roomX = this.getRandomInt(1, this.mapWidth - roomWidth - 1);
        var roomY = this.getRandomInt(1, this.mapHeight - roomHeight - 1);
        
        // Проверка пересечения с другими комнатами
        var overlap = false;
        for (var r = 0; r < rooms.length; r++) {
            var existingRoom = rooms[r];
            if (roomX < existingRoom.x + existingRoom.width + 1 &&
                roomX + roomWidth + 1 > existingRoom.x &&
                roomY < existingRoom.y + existingRoom.height + 1 &&
                roomY + roomHeight + 1 > existingRoom.y) {
                overlap = true;
                break;
            }
        }
        
        if (!overlap) {
            // Создание комнаты
            for (var ry = roomY; ry < roomY + roomHeight; ry++) {
                for (var rx = roomX; rx < roomX + roomWidth; rx++) {
                    if (ry >= 0 && ry < this.mapHeight && rx >= 0 && rx < this.mapWidth) {
                        this.map[ry][rx] = '.'; // Пустое пространство
                    }
                }
            }
            rooms.push({x: roomX, y: roomY, width: roomWidth, height: roomHeight});
        }
    }
    // Создание проходов
    this.createConnectedCorridors(rooms);
    
    // Размещение мечей и зелий
    this.placeItems(2, 'SW'); // Мечи
    this.placeItems(10, 'HP'); // Зелья здоровья
    
    // Размещение героя
    this.placeHero();
    
    // Размещение противников
    this.placeEnemies(10);
};

Game.prototype.createConnectedCorridors = function(rooms) {

    this.connectRoomsWithCorridors(rooms);
    
    this.addRandomPassages();
};

// Функция соединения комнат коридорами
Game.prototype.connectRoomsWithCorridors = function(rooms) {
    if (rooms.length < 2) return;
    

    for (var i = 0; i < rooms.length - 1; i++) {
        var room1 = rooms[i];
        var room2 = rooms[i + 1];
        
        var center1 = {
            x: Math.floor(room1.x + room1.width / 2),
            y: Math.floor(room1.y + room1.height / 2)
        };
        var center2 = {
            x: Math.floor(room2.x + room2.width / 2),
            y: Math.floor(room2.y + room2.height / 2)
        };
        

        this.createHorizontalCorridor(center1.x, center2.x, center1.y);
        this.createVerticalCorridor(center1.y, center2.y, center2.x);
    }
    
};

// Создание горизонтального коридора
Game.prototype.createHorizontalCorridor = function(x1, x2, y) {
    var start = Math.min(x1, x2);
    var end = Math.max(x1, x2);
    
    for (var x = start; x <= end; x++) {
        if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
            this.map[y][x] = '.';
            if (y > 0) this.map[y-1][x] = '.';
            if (y < this.mapHeight - 1) this.map[y+1][x] = '.';
        }
    }
};

// Создание вертикального коридора
Game.prototype.createVerticalCorridor = function(y1, y2, x) {
    var start = Math.min(y1, y2);
    var end = Math.max(y1, y2);
    
    for (var y = start; y <= end; y++) {
        if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
            this.map[y][x] = '.';
            if (x > 0) this.map[y][x-1] = '.';
            if (x < this.mapWidth - 1) this.map[y][x+1] = '.';
        }
    }
};

// Добавление случайных проходов
Game.prototype.addRandomPassages = function() {
    // Горизонтальные проходы
    var horizontalPassages = this.getRandomInt(2, 4);
    for (var i = 0; i < horizontalPassages; i++) {
        var y = this.getRandomInt(1, this.mapHeight - 2);

        var hasConnections = false;
        for (var x = 0; x < this.mapWidth; x++) {
            if (this.map[y][x] === '.' || 
                (y > 0 && this.map[y-1][x] === '.') || 
                (y < this.mapHeight - 1 && this.map[y+1][x] === '.')) {
                hasConnections = true;
                break;
            }
        }
        
        if (hasConnections) {
            for (var x = 0; x < this.mapWidth; x++) {
                this.map[y][x] = '.';
            }
        }
    }
    
    // Вертикальные проходы
    var verticalPassages = this.getRandomInt(2, 4);
    for (var i = 0; i < verticalPassages; i++) {
        var x = this.getRandomInt(1, this.mapWidth - 2);

        var hasConnections = false;
        for (var y = 0; y < this.mapHeight; y++) {
            if (this.map[y][x] === '.' || 
                (x > 0 && this.map[y][x-1] === '.') || 
                (x < this.mapWidth - 1 && this.map[y][x+1] === '.')) {
                hasConnections = true;
                break;
            }
        }
        
        if (hasConnections) {
            for (var y = 0; y < this.mapHeight; y++) {
                this.map[y][x] = '.';
            }
        }
    }
};


Game.prototype.placeItems = function(count, type) {
    for (var i = 0; i < count; i++) {
        var position = this.getRandomEmptyPosition();
        if (position) {
            this.items.push({x: position.x, y: position.y, type: type});
        }
    }
};

Game.prototype.placeHero = function() {
    var position = this.getRandomEmptyPosition();
    if (position) {
        this.hero = {
            x: position.x,
            y: position.y,
            health: 100,
            maxHealth: 100,
            attack: 10
        };
    }
};

Game.prototype.placeEnemies = function(count) {
    for (var i = 0; i < count; i++) {
        var position = this.getRandomEmptyPosition();
        if (position) {
            this.enemies.push({
                x: position.x,
                y: position.y,
                health: 30,
                maxHealth: 30,
                attack: 5,
                id: i
            });
        }
    }
};

Game.prototype.getRandomEmptyPosition = function() {
    var emptyPositions = [];
    
    for (var y = 0; y < this.mapHeight; y++) {
        for (var x = 0; x < this.mapWidth; x++) {
            if (this.map[y][x] === '.' && 
                !this.isPositionOccupied(x, y) &&
                !this.isHeroAt(x, y)) {
                emptyPositions.push({x: x, y: y});
            }
        }
    }
    
    if (emptyPositions.length > 0) {
        return emptyPositions[this.getRandomInt(0, emptyPositions.length - 1)];
    }
    return null;
};

Game.prototype.isPositionOccupied = function(x, y) {
    // Проверка противников
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].x === x && this.enemies[i].y === y) {
            return true;
        }
    }
    
    // Проверка предметов
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].x === x && this.items[i].y === y) {
            return true;
        }
    }
    
    return false;
};

Game.prototype.isHeroAt = function(x, y) {
    return this.hero && this.hero.x === x && this.hero.y === y;
};

Game.prototype.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Game.prototype.render = function() {
    var field = $('.field');
    field.empty();
     // Убираем жесткие размеры из CSS и рассчитываем динамически:
    var containerWidth = this.mapWidth * this.tileSize;
    var containerHeight = this.mapHeight * this.tileSize;
    
    field.width(containerWidth);
    field.height(containerHeight);

    for (var y = 0; y < this.mapHeight; y++) {
        for (var x = 0; x < this.mapWidth; x++) {
            var tile = $('<div class="tile"></div>');
            tile.css({
                left: x * this.tileSize,
                top: y * this.tileSize,
                width: this.tileSize,
                height: this.tileSize
            });
            
            // Отрисовка стен и пола
            if (this.map[y][x] === 'W') {
                tile.addClass('tileW');
            }
            
            // Отрисовка предметов
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].x === x && this.items[i].y === y) {
                    if (this.items[i].type === 'HP') {
                        tile.addClass('tileHP');
                    } else if (this.items[i].type === 'SW') {
                        tile.addClass('tileSW');
                    }
                }
            }
            
            // Отрисовка героя
            if (this.hero && this.hero.x === x && this.hero.y === y) {
                tile.addClass('tileP');
                var healthBar = $('<div class="health"></div>');
                healthBar.css('width', (this.hero.health / this.hero.maxHealth * 100) + '%');
                tile.append(healthBar);
            }
            
            // Отрисовка противников
            for (var i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].x === x && this.enemies[i].y === y) {
                    tile.addClass('tileE');
                    var enemyHealthBar = $('<div class="health"></div>');
                    enemyHealthBar.css('width', (this.enemies[i].health / this.enemies[i].maxHealth * 100) + '%');
                    tile.append(enemyHealthBar);
                }
            }
            
            field.append(tile);
        }
    }
};

Game.prototype.moveHero = function(direction) {
    if (!this.hero || this.hero.health <= 0) return;
    
    var newX = this.hero.x;
    var newY = this.hero.y;
    
    switch (direction) {
        case 'W': newY--; break;
        case 'A': newX--; break;
        case 'S': newY++; break;
        case 'D': newX++; break;
    }
    
    // Проверка возможности перемещения
    if (this.canMoveTo(newX, newY)) {
        this.hero.x = newX;
        this.hero.y = newY;
        this.checkItemPickup();
        this.render();
        this.updateStats();
        this.endTurn();
    }
};

Game.prototype.canMoveTo = function(x, y) {
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
        return false;
    }
    
    if (this.map[y][x] === 'W') {
        return false;
    }
    
    // Проверка на противников
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].x === x && this.enemies[i].y === y) {
            return false;
        }
    }
    
    return true;
};

Game.prototype.checkItemPickup = function() {
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].x === this.hero.x && this.items[i].y === this.hero.y) {
            if (this.items[i].type === 'HP') {
                this.hero.health = Math.min(this.hero.health + 20, this.hero.maxHealth);
            } else if (this.items[i].type === 'SW') {
                this.hero.attack += 5;
            }
            this.items.splice(i, 1);
            this.updateStats();
            break;
        }
    }
};

Game.prototype.attack = function() {
    if (!this.hero || this.hero.health <= 0) return;
    
    var attacked = false;
    var directions = [
        {dx: -1, dy: 0}, {dx: 1, dy: 0}, 
        {dx: 0, dy: -1}, {dx: 0, dy: 1},
        {dx: -1, dy: -1}, {dx: 1, dy: -1},
        {dx: -1, dy: 1}, {dx: 1, dy: 1}
    ];
    
    for (var i = 0; i < directions.length; i++) {
        var checkX = this.hero.x + directions[i].dx;
        var checkY = this.hero.y + directions[i].dy;
        
        for (var j = 0; j < this.enemies.length; j++) {
            if (this.enemies[j].x === checkX && this.enemies[j].y === checkY) {
                this.enemies[j].health -= this.hero.attack;
                attacked = true;
                
                if (this.enemies[j].health <= 0) {
                    this.enemies.splice(j, 1);
                    j--;
                }
            }
        }
    }
    
    if (attacked) {
        this.render();
        this.updateStats();
        this.endTurn();
    }
};

Game.prototype.endTurn = function() {
    this.turn++;
    this.moveEnemies();
    this.enemiesAttack();
    this.render();
    this.updateStats();
    
    this.checkGameOver();
};

Game.prototype.moveEnemies = function() {
    for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        var directions = [
            {dx: -1, dy: 0}, {dx: 1, dy: 0}, 
            {dx: 0, dy: -1}, {dx: 0, dy: 1}
        ];
        
        var randomDir = directions[this.getRandomInt(0, directions.length - 1)];
        var newX = enemy.x + randomDir.dx;
        var newY = enemy.y + randomDir.dy;
        
        if (this.canEnemyMoveTo(newX, newY)) {
            enemy.x = newX;
            enemy.y = newY;
        }
    }
};

Game.prototype.canEnemyMoveTo = function(x, y) {
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
        return false;
    }
    
    if (this.map[y][x] === 'W') {
        return false;
    }
    
    // Проверка на других противников
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].x === x && this.enemies[i].y === y) {
            return false;
        }
    }
    
    // Проверка на героя
    if (this.hero && this.hero.x === x && this.hero.y === y) {
        return false;
    }
    
    return true;
};

Game.prototype.enemiesAttack = function() {
    if (!this.hero || this.hero.health <= 0) return;
    
    for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        var dx = Math.abs(enemy.x - this.hero.x);
        var dy = Math.abs(enemy.y - this.hero.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
            this.hero.health -= enemy.attack;
        }
    }
};

Game.prototype.updateStats = function() {
    $('#hero-health').text(this.hero.health);
    $('#hero-attack').text(this.hero.attack);
    $('#enemies-count').text(this.enemies.length);
};

Game.prototype.checkGameOver = function() {
    if (this.hero.health <= 0) {
        alert('Игра окончена! Герой погиб.');
    } else if (this.enemies.length === 0) {
        alert('Поздравляем! Вы победили всех противников!');
    }
};