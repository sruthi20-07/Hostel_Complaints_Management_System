/**
 * FIX MY HOSTEL — Analytics Module (analytics.js)
 * Computes live metrics, category breakdowns, status distribution,
 * block distribution, average resolution times, and renders pure CSS/HTML/SVG visualizations.
 * Strict Sage Green & Warm Neutrals color palette.
 */

class AnalyticsController {
  init() {
    this.renderAnalytics();
  }

  renderAnalytics() {
    const stats = window.storageManager.getStatistics();
    this.renderSummaryMetrics(stats);
    this.renderCategoryChart(stats);
    this.renderStatusChart(stats);
    this.renderBlockChart(stats);
    this.renderTrendsAndHighlights(stats);
  }

  renderSummaryMetrics(stats) {
    const totalEl = document.getElementById('analytics-stat-total');
    const openEl = document.getElementById('analytics-stat-open');
    const resolvedEl = document.getElementById('analytics-stat-resolved');
    const avgTimeEl = document.getElementById('analytics-stat-avg-time');
    const overdueEl = document.getElementById('analytics-stat-overdue');
    const topCatEl = document.getElementById('analytics-stat-top-cat');

    if (totalEl) totalEl.textContent = stats.total;
    if (openEl) openEl.textContent = stats.open;
    if (resolvedEl) totalEl ? resolvedEl.textContent = stats.resolved : null;

    if (avgTimeEl) {
      if (stats.avgResolutionHours <= 0) {
        avgTimeEl.textContent = "N/A";
      } else if (stats.avgResolutionHours < 24) {
        avgTimeEl.textContent = `${stats.avgResolutionHours} hrs`;
      } else {
        const days = (stats.avgResolutionHours / 24).toFixed(1);
        avgTimeEl.textContent = `${days} days`;
      }
    }

    if (overdueEl) overdueEl.textContent = stats.overdueCount;
    if (topCatEl) topCatEl.textContent = stats.topCategory !== 'None' ? `${stats.topCategory} (${stats.topCategoryCount})` : 'None';
  }

  renderCategoryChart(stats) {
    const container = document.getElementById('chart-category-container');
    if (!container) return;

    const entries = Object.entries(stats.byCategory || {});
    if (entries.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.85rem; text-align: center; padding: 2rem;">No complaint data available.</p>';
      return;
    }

    // Sort by count descending
    entries.sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);

    container.innerHTML = entries.map(([category, count]) => {
      const percentage = Math.round((count / (stats.total || 1)) * 100);
      const widthPercent = Math.round((count / maxVal) * 100);
      const icon = window.app.getCategoryIcon(category);

      return `
        <div class="bar-chart-row">
          <div class="bar-chart-label-group">
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;">
              ${icon}
              ${Validator.escapeHtml(category)}
            </span>
            <span><strong>${count}</strong> (${percentage}%)</span>
          </div>
          <div class="bar-chart-track">
            <div class="bar-chart-fill" style="width: ${widthPercent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderStatusChart(stats) {
    const container = document.getElementById('chart-status-container');
    if (!container) return;

    const statusConfig = [
      { key: 'Submitted', color: '#74786F' },
      { key: 'Acknowledged', color: '#D97706' },
      { key: 'In Progress', color: '#66816A' },
      { key: 'Resolved', color: '#1E4E25' },
      { key: 'Reopened', color: '#C77D62' },
      { key: 'Overdue', color: '#B45309' }
    ];

    const entries = statusConfig.map(c => ({
      name: c.key,
      count: stats.byStatus[c.key] || 0,
      color: c.color
    })).filter(e => e.count > 0);

    if (entries.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.85rem; text-align: center; padding: 2rem;">No complaint status data.</p>';
      return;
    }

    const total = stats.total || 1;
    const maxVal = Math.max(...entries.map(e => e.count), 1);

    container.innerHTML = entries.map(item => {
      const percent = Math.round((item.count / total) * 100);
      const widthPercent = Math.round((item.count / maxVal) * 100);

      return `
        <div class="bar-chart-row">
          <div class="bar-chart-label-group">
            <span style="display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 600;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color};"></span>
              ${item.name}
            </span>
            <span><strong>${item.count}</strong> (${percent}%)</span>
          </div>
          <div class="bar-chart-track">
            <div class="bar-chart-fill" style="width: ${widthPercent}%; background-color: ${item.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderBlockChart(stats) {
    const container = document.getElementById('chart-block-container');
    if (!container) return;

    const entries = Object.entries(stats.byBlock || {});
    if (entries.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.85rem; text-align: center; padding: 2rem;">No block data recorded.</p>';
      return;
    }

    entries.sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);

    container.innerHTML = entries.map(([block, count]) => {
      const widthPercent = Math.round((count / maxVal) * 100);
      const percentage = Math.round((count / (stats.total || 1)) * 100);

      return `
        <div class="bar-chart-row">
          <div class="bar-chart-label-group">
            <span><strong>${Validator.escapeHtml(block)}</strong></span>
            <span>${count} (${percentage}%)</span>
          </div>
          <div class="bar-chart-track">
            <div class="bar-chart-fill terracotta" style="width: ${widthPercent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderTrendsAndHighlights(stats) {
    const container = document.getElementById('chart-trends-container');
    if (!container) return;

    const complaints = window.storageManager.getComplaints();
    if (complaints.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.85rem; text-align: center; padding: 2rem;">Not enough data for trend analysis.</p>';
      return;
    }

    // Group complaints by date of past 7 days
    const daysMap = {};
    const dayLabels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
      daysMap[dateKey] = 0;
      dayLabels.push({ key: dateKey, label });
    }

    complaints.forEach(c => {
      const cDate = c.createdAt ? c.createdAt.slice(0, 10) : '';
      if (daysMap[cDate] !== undefined) {
        daysMap[cDate]++;
      }
    });

    const maxDayCount = Math.max(...Object.values(daysMap), 1);

    container.innerHTML = `
      <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 0.5rem; height: 160px; padding-top: 1rem; border-bottom: 1px solid var(--color-border); margin-bottom: 0.75rem;">
        ${dayLabels.map(item => {
          const count = daysMap[item.key] || 0;
          const heightPercent = Math.max(12, Math.round((count / maxDayCount) * 100));

          return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 0.25rem;">
                ${count > 0 ? count : '0'}
              </span>
              <div style="width: 100%; max-width: 38px; height: ${heightPercent}%; background-color: var(--color-primary); border-radius: var(--radius-sm) var(--radius-sm) 0 0; transition: height 0.3s ease;"></div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--color-text-secondary);">
        ${dayLabels.map(item => `
          <div style="flex: 1; text-align: center;">${item.label}</div>
        `).join('')}
      </div>
    `;
  }
}

window.AnalyticsController = AnalyticsController;
window.analyticsController = new AnalyticsController();
