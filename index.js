import { useState, useEffect } from 'react'

function App() {
  const [username, setUsername] = useState('')
  const [resources, setResources] = useState(100)
  const [mineLevel, setMineLevel] = useState(1)
  const [farmLevel, setFarmLevel] = useState(0)
  const [labLevel, setLabLevel] = useState(0)
  const [towerLevel, setTowerLevel] = useState(0)
  const [vaultLevel, setVaultLevel] = useState(0)
  const [totalClaimed, setTotalClaimed] = useState(0)
  const [prestige, setPrestige] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [resourcesPerSecond, setResourcesPerSecond] = useState(0)
  const [empireAge, setEmpireAge] = useState(0)

  // Auto production + Empire Age
  useEffect(() => {
    const productionPerTick = Math.floor(
      (mineLevel * 15) + 
      (farmLevel * 14) + 
      (labLevel * 17) + 
      (towerLevel * 29) +
      (vaultLevel * 23)
    ) * (1 + prestige * 1.5)
    
    const rps = (productionPerTick / 3).toFixed(1)
    setResourcesPerSecond(rps)

    const interval = setInterval(() => {
      if (productionPerTick > 0) {
        setResources(prev => prev + productionPerTick)
      }
      setEmpireAge(prev => prev + 0.05)
    }, 3000)

    return () => clearInterval(interval)
  }, [mineLevel, farmLevel, labLevel, towerLevel, vaultLevel, prestige])

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('baseIdleEmpire')
    if (saved) {
      const data = JSON.parse(saved)
      setResources(data.resources || 100)
      setMineLevel(data.mineLevel || 1)
      setFarmLevel(data.farmLevel || 0)
      setLabLevel(data.labLevel || 0)
      setTowerLevel(data.towerLevel || 0)
      setVaultLevel(data.vaultLevel || 0)
      setPrestige(data.prestige || 0)
      setTotalClaimed(data.totalClaimed || 0)
      setEmpireAge(data.empireAge || 0)
    }
  }, [])

  // Save progress
  useEffect(() => {
    localStorage.setItem('baseIdleEmpire', JSON.stringify({
      resources, mineLevel, farmLevel, labLevel, towerLevel, vaultLevel, 
      prestige, totalClaimed, empireAge
    }))
  }, [resources, mineLevel, farmLevel, labLevel, towerLevel, vaultLevel, prestige, totalClaimed, empireAge])

  const connectWallet = () => {
    setIsConnected(true)
    setWalletAddress("0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + "...")
    alert("✅ Wallet connected successfully! (Demo Mode)")
  }

  const createEmpire = () => {
    if (username.trim() === '') {
      alert("Please enter an empire name!")
      return
    }
    alert(`🎉 Empire "${username}" is now live on Base!`)
  }

  const claimResources = () => {
    const production = Math.floor((mineLevel * 98) + (farmLevel * 88) + (labLevel * 105) + (towerLevel * 182) + (vaultLevel * 138))
    const newResources = resources + production
    setResources(newResources)
    setTotalClaimed(prev => prev + production)
    alert(`✅ Claimed ${production} Resources!`)
  }

  const upgradeMine = () => {
    const cost = Math.floor(420 + (mineLevel * 220))
    if (resources >= cost) {
      setResources(resources - cost)
      setMineLevel(mineLevel + 1)
      alert(`⛏️ Mine upgraded to Level ${mineLevel + 1}!`)
    } else {
      alert("Not enough resources!")
    }
  }

  const upgradeFarm = () => {
    const cost = Math.floor(560 + (farmLevel * 240))
    if (resources >= cost) {
      setResources(resources - cost)
      setFarmLevel(farmLevel + 1)
      alert(`🌾 Farm upgraded to Level ${farmLevel + 1}!`)
    } else {
      alert("Not enough resources!")
    }
  }

  const upgradeLab = () => {
    const cost = Math.floor(1250 + (labLevel * 280))
    if (resources >= cost) {
      setResources(resources - cost)
      setLabLevel(labLevel + 1)
      alert(`🧪 Research Lab upgraded to Level ${labLevel + 1}!`)
    } else {
      alert("Not enough resources!")
    }
  }

  const upgradeTower = () => {
    const cost = Math.floor(1950 + (towerLevel * 480))
    if (resources >= cost) {
      setResources(resources - cost)
      setTowerLevel(towerLevel + 1)
      alert(`🏰 Defense Tower upgraded to Level ${towerLevel + 1}!`)
    } else {
      alert("Not enough resources!")
    }
  }

  const upgradeVault = () => {
    const cost = Math.floor(2750 + (vaultLevel * 700))
    if (resources >= cost) {
      setResources(resources - cost)
      setVaultLevel(vaultLevel + 1)
      alert(`🏦 Vault upgraded to Level ${vaultLevel + 1}!`)
    } else {
      alert("Not enough resources!")
    }
  }

  const prestigeReset = () => {
    if (resources < 500000) {
      alert("You need at least 500,000 resources to prestige!")
      return
    }
    if (window.confirm("Prestige will reset all buildings but give you stronger permanent bonuses. Continue?")) {
      setPrestige(prev => prev + 1)
      setResources(20000)
      setMineLevel(1)
      setFarmLevel(0)
      setLabLevel(0)
      setTowerLevel(0)
      setVaultLevel(0)
      alert(`🌟 Prestige ${prestige + 1} achieved! You are a Base legend!`)
    }
  }

  const resetProgress = () => {
    if (window.confirm("Reset ALL progress? This cannot be undone.")) {
      localStorage.removeItem('baseIdleEmpire')
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">🌍 Base Idle Empire</h1>
          
          {!isConnected ? (
            <button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold">
              🔗 Connect Wallet
            </button>
          ) : (
            <div className="bg-green-900/80 text-green-400 px-6 py-3 rounded-2xl text-sm">
              ✅ {walletAddress}
            </div>
          )}
        </div>

        <p className="text-center text-emerald-400 text-xl mb-10">On-chain Idle Empire on Base</p>

        <div className="bg-gray-800/70 border border-emerald-700 rounded-3xl p-6 mb-8 text-center">
          <p className="text-xl">Empire: <span className="text-emerald-400 font-bold">{username || "Not Created"}</span></p>
          <p className="text-sm text-gray-400">
            Prestige: {prestige} • Total Earned: {totalClaimed} • Age: {Math.floor(empireAge)} minutes
          </p>
        </div>

        <div className="bg-gray-800 rounded-3xl p-14 text-center mb-12 border-2 border-emerald-600">
          <div className="text-8xl mb-4">💎</div>
          <div className="text-7xl font-bold text-emerald-400">{Math.floor(resources)}</div>
          <div className="text-2xl text-gray-400">Resources</div>
          <div className="text-emerald-400 mt-3">+{resourcesPerSecond} per second</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-gray-800 rounded-3xl p-8 text-center border border-orange-900">
            <div className="text-6xl mb-4">⛏️</div>
            <h3 className="text-2xl font-bold">Mine</h3>
            <p className="text-5xl font-bold my-4">Lv.{mineLevel}</p>
            <button onClick={upgradeMine} className="bg-orange-600 hover:bg-orange-500 w-full py-4 rounded-2xl font-bold">Upgrade</button>
          </div>

          <div className="bg-gray-800 rounded-3xl p-8 text-center border border-lime-900">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-2xl font-bold">Farm</h3>
            <p className="text-5xl font-bold my-4">Lv.{farmLevel}</p>
            <button onClick={upgradeFarm} className="bg-lime-600 hover:bg-lime-500 w-full py-4 rounded-2xl font-bold">Upgrade</button>
          </div>

          <div className="bg-gray-800 rounded-3xl p-8 text-center border border-cyan-900">
            <div className="text-6xl mb-4">🧪</div>
            <h3 className="text-2xl font-bold">Research Lab</h3>
            <p className="text-5xl font-bold my-4">Lv.{labLevel}</p>
            <button onClick={upgradeLab} className="bg-cyan-600 hover:bg-cyan-500 w-full py-4 rounded-2xl font-bold">Upgrade</button>
          </div>

          <div className="bg-gray-800 rounded-3xl p-8 text-center border border-purple-900">
            <div className="text-6xl mb-4">🏰</div>
            <h3 className="text-2xl font-bold">Defense Tower</h3>
            <p className="text-5xl font-bold my-4">Lv.{towerLevel}</p>
            <button onClick={upgradeTower} className="bg-purple-600 hover:bg-purple-500 w-full py-4 rounded-2xl font-bold">Upgrade</button>
          </div>

          <div className="bg-gray-800 rounded-3xl p-8 text-center border border-amber-900">
            <div className="text-6xl mb-4">🏦</div>
            <h3 className="text-2xl font-bold">Vault</h3>
            <p className="text-5xl font-bold my-4">Lv.{vaultLevel}</p>
            <button onClick={upgradeVault} className="bg-amber-600 hover:bg-amber-500 w-full py-4 rounded-2xl font-bold">Upgrade</button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button onClick={claimResources} className="bg-blue-600 hover:bg-blue-500 text-2xl px-20 py-7 rounded-3xl font-bold">
            ⚡ Claim Resources
          </button>

          <button onClick={prestigeReset} className="bg-purple-600 hover:bg-purple-500 px-12 py-4 rounded-2xl font-bold text-lg">
            🌟 Prestige Reset
          </button>

          <button onClick={resetProgress} className="text-red-400 hover:text-red-500 text-sm mt-4">
            Reset All Progress
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 mt-16">
          Commit 52/100 • The empire keeps expanding!
        </div>
      </div>
    </div>
  )
}

export default App
