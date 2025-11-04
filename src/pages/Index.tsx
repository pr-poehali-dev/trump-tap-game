import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Skin {
  id: string;
  name: string;
  emoji: string;
  unlockAt: number;
  unlocked: boolean;
}

interface MiniGame {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const SKINS: Skin[] = [
  { id: 'default', name: 'Классический', emoji: '🤠', unlockAt: 0, unlocked: true },
  { id: 'business', name: 'Бизнесмен', emoji: '👔', unlockAt: 1000, unlocked: false },
  { id: 'president', name: 'Президент', emoji: '🎩', unlockAt: 2000, unlocked: false },
  { id: 'superhero', name: 'Супергерой', emoji: '🦸', unlockAt: 3000, unlocked: false },
  { id: 'astronaut', name: 'Астронавт', emoji: '🚀', unlockAt: 4000, unlocked: false },
  { id: 'king', name: 'Король', emoji: '👑', unlockAt: 5000, unlocked: false },
  { id: 'rockstar', name: 'Рокзвезда', emoji: '🎸', unlockAt: 7000, unlocked: false },
  { id: 'pirate', name: 'Пират', emoji: '🏴‍☠️', unlockAt: 10000, unlocked: false },
];

const MINI_GAMES: MiniGame[] = [
  { id: 'speed', name: 'Скоростной клик', icon: 'Zap', description: 'Кликай максимально быстро за 10 секунд!' },
  { id: 'memory', name: 'Мемори', icon: 'Brain', description: 'Запомни и повтори последовательность' },
  { id: 'lucky', name: 'Лаки-колесо', icon: 'TrendingUp', description: 'Крути колесо и выигрывай клики' },
];

export default function Index() {
  const [clicks, setClicks] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [currentSkin, setCurrentSkin] = useState('default');
  const [skins, setSkins] = useState(SKINS);
  const [isClicking, setIsClicking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [speedGameActive, setSpeedGameActive] = useState(false);
  const [speedTimer, setSpeedTimer] = useState(10);
  const [speedClicks, setSpeedClicks] = useState(0);
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [memoryInput, setMemoryInput] = useState<number[]>([]);
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [showingSequence, setShowingSequence] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<Array<{ id: number; x: number; y: number; value: number }>>([]);

  const currentSkinData = skins.find(s => s.id === currentSkin) || SKINS[0];
  const nextMilestone = SKINS.find(s => !s.unlocked)?.unlockAt || 10000;
  const progress = (clicks % 1000) / 10;

  useEffect(() => {
    const updatedSkins = skins.map(skin => ({
      ...skin,
      unlocked: clicks >= skin.unlockAt
    }));
    
    const newlyUnlocked = updatedSkins.find((skin, idx) => 
      skin.unlocked && !skins[idx].unlocked && skin.id !== 'default'
    );
    
    if (newlyUnlocked) {
      setSkins(updatedSkins);
      setShowConfetti(true);
      
      const successSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAA=');
      successSound.volume = 0.5;
      successSound.play().catch(() => {});
      
      toast.success(`🎉 Разблокирован скин: ${newlyUnlocked.name}!`, {
        description: `Новый образ доступен в коллекции!`,
      });
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setSkins(updatedSkins);
    }
  }, [clicks]);

  useEffect(() => {
    if (speedGameActive && speedTimer > 0) {
      const timer = setTimeout(() => setSpeedTimer(speedTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (speedGameActive && speedTimer === 0) {
      endSpeedGame();
    }
  }, [speedTimer, speedGameActive]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setClicks(clicks + clickPower);
    setIsClicking(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPoint = {
      id: Date.now() + Math.random(),
      x,
      y,
      value: clickPower
    };
    setFloatingPoints(prev => [...prev, newPoint]);
    
    const clickSound = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAAA=');
    clickSound.volume = 0.3;
    clickSound.play().catch(() => {});
    
    setTimeout(() => setIsClicking(false), 300);
    setTimeout(() => {
      setFloatingPoints(prev => prev.filter(p => p.id !== newPoint.id));
    }, 1000);
  };

  const handleSpeedClick = () => {
    setSpeedClicks(speedClicks + 1);
    const clickSound = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAAA=');
    clickSound.volume = 0.3;
    clickSound.play().catch(() => {});
  };

  const startSpeedGame = () => {
    setSpeedGameActive(true);
    setSpeedTimer(10);
    setSpeedClicks(0);
  };

  const endSpeedGame = () => {
    setSpeedGameActive(false);
    const bonus = speedClicks * 2;
    setClicks(clicks + bonus);
    toast.success(`Скоростной бонус: +${bonus} кликов!`, {
      description: `Ты сделал ${speedClicks} кликов за 10 секунд!`,
    });
  };

  const startMemoryGame = () => {
    const sequence = Array.from({ length: memoryLevel + 2 }, () => Math.floor(Math.random() * 4));
    setMemorySequence(sequence);
    setMemoryInput([]);
    setShowingSequence(true);
    
    toast.info('Запоминай последовательность!', {
      description: 'Нажми на кнопки в правильном порядке',
    });
  };

  const handleMemoryClick = (num: number) => {
    if (showingSequence) return;
    
    const newInput = [...memoryInput, num];
    setMemoryInput(newInput);
    
    if (newInput[newInput.length - 1] !== memorySequence[newInput.length - 1]) {
      toast.error('Неправильно! Попробуй снова', {
        description: `Заработано кликов: ${memoryLevel * 50}`,
      });
      setClicks(clicks + memoryLevel * 50);
      setMemoryLevel(1);
      setMemorySequence([]);
      setMemoryInput([]);
      return;
    }
    
    if (newInput.length === memorySequence.length) {
      const bonus = memoryLevel * 100;
      setClicks(clicks + bonus);
      setMemoryLevel(memoryLevel + 1);
      toast.success(`Правильно! +${bonus} кликов!`, {
        description: `Уровень ${memoryLevel + 1}`,
      });
      setMemorySequence([]);
      setMemoryInput([]);
    }
  };

  const spinLuckyWheel = () => {
    const prizes = [50, 100, 200, 500, 1000];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    setClicks(clicks + prize);
    toast.success(`🎰 Выигрыш: +${prize} кликов!`, {
      description: 'Попробуй ещё раз!',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute confetti-pop text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.3}s`,
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-slate-800 mb-2">
            Presidential Clicker
          </h1>
          <p className="text-lg text-slate-600">Достигай целей и получай награды</p>
        </div>

        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="game" className="text-base">
              <Icon name="Gamepad2" size={20} className="mr-2" />
              Игра
            </TabsTrigger>
            <TabsTrigger value="skins" className="text-base">
              <Icon name="Sparkles" size={20} className="mr-2" />
              Скины
            </TabsTrigger>
            <TabsTrigger value="minigames" className="text-base">
              <Icon name="Trophy" size={20} className="mr-2" />
              Мини-игры
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="space-y-6">
            <Card className="p-6 bg-white shadow-lg border border-slate-200">
              <div className="text-center mb-4">
                <div className="text-6xl font-bold text-slate-800">
                  {clicks.toLocaleString()}
                </div>
                <p className="text-lg text-slate-600 mt-2">очков набрано</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Прогресс до награды</span>
                  <Badge variant="secondary" className="font-semibold bg-slate-200 text-slate-700">
                    {nextMilestone - clicks} очков
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative">
                  <button
                    onClick={handleClick}
                    className={`relative w-56 h-56 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                      isClicking ? 'game-bounce' : ''
                    } pulse-glow border-4 border-slate-300 overflow-hidden bg-white`}
                  >
                    <img 
                      src="https://cdn.poehali.dev/projects/fcba8f5b-b608-4ea0-a8b1-f2771c8deda0/files/68d33226-d2ee-415a-a2c8-3724e293a56e.jpg" 
                      alt="Trump"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {floatingPoints.map(point => (
                    <div
                      key={point.id}
                      className="absolute text-2xl font-bold text-blue-600 pointer-events-none animate-[float-up_1s_ease-out_forwards]"
                      style={{
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                      }}
                    >
                      +{point.value}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Текущий скин</p>
                <Badge variant="outline" className="text-lg px-4 py-2 font-semibold">
                  {currentSkinData.name}
                </Badge>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Эффективность</p>
                  <p className="text-3xl font-bold text-slate-800">+{clickPower}</p>
                </div>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (clicks >= 500) {
                      setClicks(clicks - 500);
                      setClickPower(clickPower + 1);
                      toast.success('Улучшение куплено!', {
                        description: `Теперь сила клика: +${clickPower + 1}`,
                      });
                    } else {
                      toast.error('Недостаточно кликов!', {
                        description: 'Нужно 500 кликов',
                      });
                    }
                  }}
                >
                  <Icon name="TrendingUp" size={20} className="mr-2" />
                  Улучшить (500)
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="skins" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skins.map(skin => (
                <Card
                  key={skin.id}
                  className={`p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    currentSkin === skin.id
                      ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md'
                      : skin.unlocked
                      ? 'bg-white hover:shadow-lg border-slate-200'
                      : 'bg-gray-50 opacity-50 border-slate-300'
                  }`}
                  onClick={() => {
                    if (skin.unlocked) {
                      setCurrentSkin(skin.id);
                      toast.success(`Скин изменён: ${skin.name}`);
                    } else {
                      toast.error('Скин заблокирован', {
                        description: `Нужно ${skin.unlockAt} кликов`,
                      });
                    }
                  }}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">{skin.emoji}</div>
                    <p className="font-semibold text-sm mb-1">{skin.name}</p>
                    {!skin.unlocked && (
                      <Badge variant="secondary" className="text-xs">
                        <Icon name="Lock" size={12} className="mr-1" />
                        {skin.unlockAt}
                      </Badge>
                    )}
                    {skin.unlocked && currentSkin === skin.id && (
                      <Badge className="text-xs bg-blue-600">
                        <Icon name="Check" size={12} className="mr-1" />
                        Активен
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="minigames" className="space-y-4">
            <Card className="p-6 bg-white shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold flex items-center text-slate-800">
                    <Icon name="Zap" size={28} className="mr-2 text-slate-700" />
                    Скоростной режим
                  </h3>
                  <p className="text-slate-600">Кликай максимально быстро за 10 секунд</p>
                </div>
              </div>
              {!speedGameActive ? (
                <Button 
                  size="lg" 
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                  onClick={startSpeedGame}
                >
                  Начать игру
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-slate-800">{speedTimer}</div>
                    <p className="text-slate-600">секунд осталось</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full h-32 text-3xl bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSpeedClick}
                  >
                    КЛИК! ({speedClicks})
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-white shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold flex items-center text-slate-800">
                    <Icon name="Brain" size={28} className="mr-2 text-slate-700" />
                    Память
                  </h3>
                  <p className="text-slate-600">Запомни и повтори последовательность</p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1 border-slate-300">
                  Уровень {memoryLevel}
                </Badge>
              </div>
              
              {memorySequence.length === 0 ? (
                <Button 
                  size="lg" 
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                  onClick={startMemoryGame}
                >
                  Начать игру
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map(num => (
                    <Button
                      key={num}
                      size="lg"
                      className={`h-24 text-2xl ${
                        showingSequence && memorySequence.includes(num)
                          ? 'bg-blue-600 animate-pulse text-white'
                          : 'bg-slate-600 hover:bg-slate-700 text-white'
                      }`}
                      onClick={() => handleMemoryClick(num)}
                      disabled={showingSequence}
                    >
                      {num + 1}
                    </Button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 bg-white shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold flex items-center text-slate-800">
                    <Icon name="TrendingUp" size={28} className="mr-2 text-slate-700" />
                    Бонусное колесо
                  </h3>
                  <p className="text-slate-600">Испытай удачу и получи награду</p>
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-slate-700 hover:bg-slate-800 text-white disabled:bg-slate-300"
                onClick={spinLuckyWheel}
                disabled={clicks < 100}
              >
                {clicks >= 100 ? 'Крутить колесо (100 очков)' : 'Нужно 100 очков'}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}