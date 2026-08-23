import { useNavigate } from 'react-router-dom';
import './index.less';
import { configData } from '@/conf/configData';
import { IBaseInterface } from '@/types/global';
import { publicUrl } from '@/utils/publicUrl';

function HomePage() {
    const navigate = useNavigate();

    function handleClick(item: IBaseInterface.IConfigItem) {
        navigate(item.path);
    }

    return (
        <main className="example-catalogue">
            <div className="catalogue-content">
                <header className="catalogue-header">
                    <div>
                        <p className="catalogue-eyebrow">THREE.JS PLAYGROUND</p>
                        <h1>交互视觉示例</h1>
                        <p>从场景、材质到数据可视化，选择一个示例开始浏览。</p>
                    </div>
                    <p className="catalogue-count"><strong>{String(configData.length).padStart(2, '0')}</strong> 个示例</p>
                </header>
                <section className="example-grid" aria-label="示例列表">
                    {configData.map((item, index) => (
                        <button key={item.id} className="example-card" type="button" onClick={() => handleClick(item)}>
                            <span className="example-preview" aria-hidden="true">
                                <img src={publicUrl(item.thumbnail.path)} alt="" loading="lazy" onError={(event) => event.currentTarget.remove()} />
                                <span className="example-preview-fallback" />
                            </span>
                            <span className="example-index">{String(index + 1).padStart(2, '0')}</span>
                            <span className="example-name">{item.name}</span>
                            <span className="example-action" aria-hidden="true">打开</span>
                        </button>
                    ))}
                </section>
            </div>
        </main>
    );
}

export default HomePage;
