<template>
  <div class="dashboard">
    <h2 class="page-title">📊 Tableau de bord - AllonsCinoche</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎬</div>
        <div class="stat-content">
          <h3>Films actifs</h3>
          <p class="stat-number">24</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🏢</div>
        <div class="stat-content">
          <h3>Cinémas partenaires</h3>
          <p class="stat-number">8</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <h3>Séances programmées</h3>
          <p class="stat-number">156</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <h3>Note moyenne</h3>
          <p class="stat-number">4.2</p>
        </div>
      </div>
    </div>
    
    <div class="quick-actions">
      <h3>Actions rapides</h3>
      <div class="actions-grid">
        <button class="action-button primary">
          <span class="action-icon">➕</span>
          Ajouter un nouveau film
        </button>
        <button class="action-button secondary">
          <span class="action-icon">📝</span>
          Créer une programmation
        </button>
        <button class="action-button tertiary">
          <span class="action-icon">📊</span>
          Voir les statistiques
        </button>
      </div>
    </div>
    
    <div class="recent-activity">
      <h3>Activité récente</h3>
      <div class="activity-list">
        <div class="activity-item">
          <div class="activity-icon">🎬</div>
          <div class="activity-content">
            <p><strong>Nouveau film ajouté:</strong> "Inception"</p>
            <span class="activity-time">Il y a 2 heures</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">📅</div>
          <div class="activity-content">
            <p><strong>Programmation mise à jour:</strong> Cinéma Lumière</p>
            <span class="activity-time">Il y a 4 heures</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">🏢</div>
          <div class="activity-content">
            <p><strong>Nouveau cinéma partenaire:</strong> UGC Odéon</p>
            <span class="activity-time">Hier</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Composant Dashboard
</script>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #2d3748;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.875rem;
  transition: all 0.3s ease;
  min-height: 80px;
  box-sizing: border-box;
  width: 100%;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-number {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.quick-actions, .recent-activity {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.quick-actions h3, .recent-activity h3 {
  margin: 0 0 1.25rem 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 700;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.875rem;
  width: 100%;
}

.action-button {
  padding: 1rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.action-button.tertiary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0);
  transition: transform 0.3s ease;
  border-radius: 12px;
}

.action-button:hover::before {
  transform: scale(1);
}

.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.action-icon {
  font-size: 1.2rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 0.95rem;
  font-weight: 500;
}

.activity-time {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 400;
}

/* Responsive design optimisé */
@media (min-width: 1200px) {
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
  
  .stat-card {
    padding: 1.5rem;
    border-radius: 15px;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 2.5rem;
    border-radius: 12px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .stat-content h3 {
    font-size: 0.9rem;
  }
  
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .action-button {
    padding: 1.25rem 1.5rem;
    font-size: 1rem;
  }
  
  .quick-actions, .recent-activity {
    padding: 1.5rem;
  }
  
  .quick-actions h3, .recent-activity h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 1.125rem;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }
  
  .quick-actions, .recent-activity {
    padding: 1rem;
    margin-bottom: 1.25rem;
  }
  
  .quick-actions h3, .recent-activity h3 {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
    min-height: 70px;
  }
  
  .stat-icon {
    width: 45px;
    height: 45px;
    font-size: 1.75rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-content h3 {
    font-size: 0.75rem;
  }
  
  .action-button {
    padding: 1rem;
    font-size: 0.875rem;
  }
}
</style>